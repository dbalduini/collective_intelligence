const Classifier = require('./classifier')

/**
 * Bayes' Theorem is a way of flipping around conditional probabilities.
 * P(A | B) = P(B | A) × P(A) / P(B)
 */
class NaiveBayesClassifier extends Classifier {
  constructor() {
    super()
    this.thresholds = {}
  }

  getThreshold(cat) {
    return this.thresholds[cat] ? this.thresholds[cat] : 1.0
  }

  // Pr(Document | Category)
  getDocumentProb(doc, cat) {
    let features = this.getFeatures(doc)
    // P(A ∩ B) = P(A) * P(B)
    const f = (acc, w) => acc * this.getWeightedProb(w, cat)
    return features.reduce(f, 1)
  }

  // Returns the probability of a document belonging to an category.
  // P(Category | Document) = P(Document | Category) × P(Category) / P(Document)
  // P(Document) = 1
  // P(Category | Document) = P(Document | Category) × P(Category)
  getCategoryProbForDocument(doc, cat) {
    let pCategory = this.countCategory(cat) / this.getTotalItemsCount()
    let pDocument = this.getDocumentProb(doc, cat)
    return pDocument * pCategory
  }

  classify(doc) {
    const defaultCategory = 'unknown'
    let probs = {}
    let best = null
    let max = 0.0

    // find the best (max) probability
    for (let cat of this.getCategories()) {
      probs[cat] = this.getCategoryProbForDocument(doc, cat)
      if (probs[cat] > max) {
        max = probs[cat]
        best = cat
      }
    }

    // make sure the prob doesnt exceed the threashold
    for (let cat in probs) {
      if (cat === best) {
        continue
      }
      // For an item to be classified into a particular category,
      // its probability must be a specified amount (threshold) larger
      // than the probability for any other category.
      if (probs[best] < probs[cat] * this.thresholds[best]) {
        return defaultCategory
      }
    }

    return best
  }
}

module.exports = NaiveBayesClassifier
