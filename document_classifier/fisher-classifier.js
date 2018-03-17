const Classifier = require('./classifier')

/**
 * The Fisher method calculates the probability of a category for each 
 * word in the document, then combines the probabilities and tests to see 
 * if the set of probabilities is more or less likely than a random set.
 */
class FisherClassifier extends Classifier {
  constructor() {
    super()
    // Configure the lower bounds for classification
    this.minimums = {}
  }

  getMinimum(cat) {
    return this.minimums[cat] ? this.minimums[cat] : 0
  }

  // P(category | feature)
  getCategoryProbForFeature(word, cat) {
    let p = this.getWordProbGivenCategory(word, cat)
    if (p === 0.0) {
      return 0.0
    }
    
    // Sum the word probabilities from all categories
    let pTotal = 0.0
    for (let c of this.getCategories()) {
      pTotal += this.getWordProbGivenCategory(word, c)
    }

    return p / pTotal
  }

  fisherProbability(doc, cat) {
    // multiply all probabilties
    let features = this.getFeatures(doc)

    // P(A ∩ B) = P(A) * P(B)
    let pTotal = features.reduce((acc, w) => {
      let p = this.getCategoryProbForFeature(w, cat)
      return acc * this.getWeightedProb(w, cat, p)
    }, 1)

    // Take the natural log and multiply by −2
    let fScore = -2 * Math.log(pTotal)

    return inverseChiSquare(fScore, features.length)
  }

  classify(item) {
    let best = 'unknown'
    let max = 0.0

    // find the best (max) probability
    for (let c of this.getCategories()) {
      let p = this.fisherProbability(item, c)
      if (p > max && p > this.getMinimum(c)) {
        best = c
        max = p
      }
    }
    return best
  }
}

// @see https://en.wikipedia.org/wiki/Inverse-chi-squared_distribution
function inverseChiSquare(chi, df) {
  let m = chi / 2.0
  let sum = term = Math.exp(-m)
  for (let i = 1 ; i < df; i++) {
    term *= m / i
    sum += term
  }
  return Math.min(sum, 1.0)
}

module.exports = FisherClassifier
