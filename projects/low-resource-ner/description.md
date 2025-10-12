# Cross-lingual Transfer Learning for Low-Resource NLP

**Research Project** | Natural Language Processing

A novel framework combining transfer learning and pseudo-labeling to improve Named Entity Recognition (NER) performance in underrepresented languages with limited training data.

## What I Built

I developed a self-training pipeline that leverages knowledge from high-resource languages to enhance NER models for low-resource languages. The system addresses a critical gap in NLP—billions of people speak languages that lack the annotated data needed for modern AI systems to work effectively.

## Technical Approach

- Implemented a **BERT-BiLSTM-CRF** architecture (179M parameters) optimized for sequence tagging tasks
- Designed a cross-lingual transfer learning pipeline that pretrains on high-resource languages before fine-tuning on target low-resource languages
- Created an iterative pseudo-labeling framework that generates high-confidence predictions on unlabeled data from syntactically similar languages
- Tested across **six diverse language families** (Malagasy, Faroese, Corsican, Upper Sorbian, Bhojpuri, Chuvash) to ensure generalizability

## Key Results

The methods demonstrated significant improvements over baseline models:
- **13.00% improvement** (maximum) using transfer learning alone
- **6.99% improvement** using the novel self-training framework without additional manual annotation
- **Average 7.7% improvement** across all language families with transfer learning
- Successfully reduced reliance on manually labeled data while maintaining high F1-scores (>0.8)

## Technologies

Python | PyTorch | BERT | CUDA | BiLSTM-CRF | WikiANN Dataset | Semi-supervised Learning

---

**Impact**: This research provides a framework for developing NLP applications in previously underrepresented languages, helping bridge the digital divide and extend state-of-the-art language technologies to billions of underserved speakers worldwide.