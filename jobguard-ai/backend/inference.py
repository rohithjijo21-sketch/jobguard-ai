"""Dependency-free inference exported from the existing fitted sklearn model.

Implements its word analyzer, sublinear TF, IDF, L2 normalization, and binary
logistic decision function. No retraining or heuristic changes are performed.
"""
import json
import math
import re
from collections import Counter
from pathlib import Path

_DATA = json.loads(Path(__file__).with_name('inference.json').read_text(encoding='utf-8'))
_TOKEN = re.compile(_DATA['token_pattern'])
_STOP = frozenset(_DATA['stop_words'])
_VOCAB = _DATA['vocabulary']


def analyze_text(text):
    tokens = _TOKEN.findall(text.lower() if _DATA['lowercase'] else text)
    tokens = [token for token in tokens if token not in _STOP]
    counts = Counter()
    for n in range(_DATA['ngram_range'][0], _DATA['ngram_range'][1] + 1):
        for offset in range(len(tokens) - n + 1):
            term = ' '.join(tokens[offset:offset + n])
            index = _VOCAB.get(term)
            if index is not None:
                counts[index] += 1
    weights = {index: (1 + math.log(count) if _DATA['sublinear_tf'] else count) * _DATA['idf'][index] for index, count in counts.items()}
    norm = math.sqrt(sum(value * value for value in weights.values()))
    score = _DATA['intercept']
    if norm:
        score += sum(value / norm * _DATA['coefficients'][index] for index, value in weights.items())
    positive = 1 / (1 + math.exp(-score)) if score >= 0 else math.exp(score) / (1 + math.exp(score))
    prediction = 1 if score > 0 else 0
    return int(_DATA['classes'][prediction]), (positive if prediction else 1 - positive) * 100
