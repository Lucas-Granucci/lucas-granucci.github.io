# Modular Multi-Agent LLM Framework for Scientific Translation in Low-Resource Languages
**Research Project** | Natural Language Processing

A modular, agentic large language model (LLM) translation framework with specialized terminology and retrieval agents, incorporating flow-aware and long-range memory management via graph-based document modeling—designed.

## What I Built

I developed a multi-agent scientific translation pipeline designed to accurately translate full-length academic documents into low-resource languages. The framework uses specialized agents to handle domain-specific terminology, long-range discourse coherence, and scarce training data.

## Technical Approach

- Built a **modular agentic LLM pipeline** on top of GPT-4.1, with specialized agents for terminology management, RAG-based context retrieval, and document-level memory
- Adopted the **GRAFT graph-based document modeling** strategy, representing documents as Directed Acyclic Graphs (DAGs) of discourse units to maintain flow-aware, long-range coherence across translations
- Designed a **novel backtranslation pipeline** to generate pseudo-parallel corpora from abundant monolingual scientific text, enabling adaptation to any language with sufficient monolingual data
- Evaluated across **four low-resource languages**—Thai, Swahili, Vietnamese, and Turkish—using reference-based neural metrics (COMET, BLEU, chrF, TER, BLEURT)

## Key Results

The proposed framework outperformed all baseline models across every language pair:
- **+2.17% average COMET improvement** over ChatGPT-4.1
- **+1.60% average COMET improvement** over Google Translate
- **+4.4% COMET improvement** on English → Thai (vs. ChatGPT-4.1), the largest single-language gain
- **+17.1% COMET improvement** on English → Thai (vs. NLLB-600M)
- Lower-resource languages (Thai, Swahili) showed the greatest improvement, while higher-resource languages (Turkish, Vietnamese) achieved the highest raw COMET scores overall

## Technologies

Python | OpenAI API | RAG | PyMuPDF4LLM | OpenAlex | COMET | BLEU 

---

**Impact**: This research contributes to the democratization of science globally by making academic literature more accessible in underrepresented languages.
