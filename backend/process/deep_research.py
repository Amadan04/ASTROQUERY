# process/deep_research.py
import json
import numpy as np
from sqlalchemy.orm import Session
from db import SessionLocal
from models import Publication, Entity, Triple
from vector_engine import VectorEngine
from process.ai_pipeline import _llm
from trends import compute_entity_trends
from utils.text_clean import safe_truncate
from config import Config


def _normalize_score(distance: float) -> float:
    """
    Convert FAISS distance (0 = identical) to a 0–100 originality score.
    """
    if distance < 0:
        return 100.0
    return max(0.0, min(100.0, (1 - min(distance / 1.2, 1.0)) * 100))


def _compare_entities(section_text: str, db: Session) -> tuple[list[str], float]:
    """
    Compare extracted entities in the input section to the DB to estimate conceptual novelty.
    """
    words = [w.strip().lower() for w in section_text.split() if len(w) > 4]
    all_entities = [e.text.lower() for e in db.query(Entity.text).all()]
    overlap = len(set(words) & set(all_entities))
    ratio = overlap / max(len(words), 1)
    conceptual_originality = (1 - min(ratio * 10, 1)) * 100
    matched_entities = list(set(words) & set(all_entities))
    return matched_entities[:10], conceptual_originality


def _get_trend_penalty(entities: list[str]) -> float:
    """
    Lower novelty if entities are trending heavily (common in recent years).
    """
    trends = compute_entity_trends()
    latest_years = sorted(trends.keys())[-3:] if trends else []
    freq = 0
    total = 0
    for y in latest_years:
        for e in entities:
            freq += trends[y].get(e, 0)
            total += 1
    if total == 0:
        return 0
    density = freq / total
    penalty = min(density * 5, 20)  # up to -20% novelty
    return penalty


def analyze_research_paper(title: str, sections: dict[str, str], top_k: int = 5):
    """
    Deep originality and feedback analysis of a research paper.
    """
    print(f"🔬 Deep Research: Starting analysis for '{title}'")
    print(f"🔬 Deep Research: Sections: {list(sections.keys())}")
    
    # Quick test mode - return mock results if LLM is not available
    if not Config.OPENROUTER_API_KEY:
        print("🔬 Deep Research: No OpenRouter API key - returning mock results")
        return {
            "title": title,
            "overall_novelty": 75.5,
            "section_results": {
                "abstract": {
                    "semantic_novelty": 80.0,
                    "conceptual_novelty": 70.0,
                    "trend_penalty": 5.0,
                    "final_novelty": 72.5,
                    "similar_works": [],
                    "matched_entities": ["research", "analysis", "study"],
                    "feedback": "Mock analysis: This section shows good novelty with some overlap with existing work."
                }
            },
            "meta_summary": "Mock meta-analysis: Overall good originality with room for improvement in methodology section."
        }
    
    db: Session = SessionLocal()
    print("🔬 Deep Research: Database session created")
    
    ve = VectorEngine(persist=True)
    print("🔬 Deep Research: Vector engine initialized")

    results = {}
    novelty_scores = []
    insights_cache = []
    try:
        for sec_name, text in sections.items():
            print(f"🔬 Deep Research: Processing section '{sec_name}'")
            if not text or len(text.strip()) < 100:
                print(f"🔬 Deep Research: Skipping section '{sec_name}' - too short")
                continue

            print(f"🔬 Deep Research: Step 1 - Semantic search for '{sec_name}'")
            # Step 1 — semantic search
            matches = ve.search(text, top_k=top_k, section=sec_name.lower())
            print(f"🔬 Deep Research: Found {len(matches)} matches")
            avg_dist = np.mean([m[2] for m in matches]) if matches else 1.0
            semantic_novelty = _normalize_score(avg_dist)
            print(f"🔬 Deep Research: Semantic novelty: {semantic_novelty}")

            print(f"🔬 Deep Research: Step 2 - Conceptual overlap for '{sec_name}'")
            # Step 2 — conceptual overlap
            matched_entities, conceptual_novelty = _compare_entities(text, db)
            print(f"🔬 Deep Research: Conceptual novelty: {conceptual_novelty}")

            print(f"🔬 Deep Research: Step 3 - Trend penalty for '{sec_name}'")
            # Step 3 — adjust for recent popularity
            trend_penalty = _get_trend_penalty(matched_entities)
            final_novelty = max(0, (semantic_novelty + conceptual_novelty) / 2 - trend_penalty)
            print(f"🔬 Deep Research: Final novelty: {final_novelty}")

            print(f"🔬 Deep Research: Step 4 - Similar works for '{sec_name}'")
            # Step 4 — sample similar works for context
            related = []
            for pub_id, section_kind, dist in matches[:3]:
                p = db.get(Publication, pub_id)
                if not p:
                    continue
                related.append({
                    "title": p.title,
                    "journal": p.journal,
                    "year": p.year,
                    "distance": round(dist, 3),
                    "summary": safe_truncate(p.summary or "", 500)
                })
            insights_cache.extend([r["title"] for r in related])
            print(f"🔬 Deep Research: Found {len(related)} related works")

            print(f"🔬 Deep Research: Step 5 - LLM feedback for '{sec_name}'")
            # Step 5 — LLM feedback generation
            sys_prompt = (
                "You are a scientific reviewer AI. "
                "Assess the provided section for novelty, originality, and potential improvement. "
                "Be specific about what aspects are unique, what overlaps with existing work, "
                "and suggest how to strengthen the section."
            )
            user_prompt = f"""
            Research Title: {title}
            Section: {sec_name}
            Section Text:
            {safe_truncate(text, 4000)}

            Similar Prior Work (context):
            {json.dumps(related, indent=2)}

            Key entities found in your section:
            {', '.join(matched_entities)}

            Provide:
            - Novelty assessment (0–100 scale)
            - Overlap commentary
            - Strengths
            - Weaknesses
            - Suggestions for improvement
            - Recommended related topics
            """

            print(f"🔬 Deep Research: Calling LLM for '{sec_name}'...")
            try:
                feedback = _llm("openai/gpt-4.1-mini", sys_prompt, user_prompt, temperature=0.4)
                print(f"🔬 Deep Research: LLM feedback received for '{sec_name}'")
            except Exception as e:
                print(f"🔬 Deep Research: LLM error for '{sec_name}': {e}")
                feedback = f"LLM analysis unavailable for {sec_name}. Semantic novelty: {semantic_novelty:.1f}%, Conceptual novelty: {conceptual_novelty:.1f}%"

            results[sec_name] = {
                "semantic_novelty": round(semantic_novelty, 2),
                "conceptual_novelty": round(conceptual_novelty, 2),
                "trend_penalty": round(trend_penalty, 2),
                "final_novelty": round(final_novelty, 2),
                "similar_works": related,
                "matched_entities": matched_entities,
                "feedback": feedback.strip(),
            }

            novelty_scores.append(final_novelty)

        overall_score = round(np.mean(novelty_scores), 2) if novelty_scores else 0
        print(f"🔬 Deep Research: Overall score calculated: {overall_score}")

        print("🔬 Deep Research: Step 6 - Global synthesis (meta-analysis)")
        # Step 6 — Global synthesis (meta-analysis)
        sys_prompt = "You are an expert scientific analyst summarizing originality and improvement opportunities across a paper."
        user_prompt = f"""
        Title: {title}
        Section results:
        {json.dumps(results, indent=2)}

        Summarize:
        - Overall originality
        - What parts are novel vs derivative
        - Suggested structural or thematic improvements
        - Key overlooked angles
        - Research impact potential
        """
        print("🔬 Deep Research: Calling LLM for meta-analysis...")
        try:
            meta_summary = _llm("openai/gpt-4.1-mini", sys_prompt, user_prompt, temperature=0.3)
            print("🔬 Deep Research: Meta-analysis complete")
        except Exception as e:
            print(f"🔬 Deep Research: Meta-analysis LLM error: {e}")
            meta_summary = f"Meta-analysis unavailable. Overall novelty score: {overall_score}%. Analysis completed for {len(results)} sections."

        result = {
            "title": title,
            "overall_novelty": overall_score,
            "section_results": results,
            "meta_summary": meta_summary.strip(),
        }
        print(f"🔬 Deep Research: Analysis complete, returning result with keys: {list(result.keys())}")
        return result

    finally:
        db.close()
