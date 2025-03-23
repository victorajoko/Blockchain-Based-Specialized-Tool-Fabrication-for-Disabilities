;; Effectiveness Feedback Contract
;; Collects user input on tool functionality

;; Define data variables
(define-data-var last-user-id uint u0)
(define-data-var last-feedback-id uint u0)
(define-data-var last-assessment-id uint u0)
(define-data-var last-improvement-id uint u0)

;; Map to store user profiles
(define-map users
  { id: uint }
  {
    owner: principal,
    name: (string-ascii 100),
    disability-type: (string-ascii 100),
    specific-needs: (string-ascii 500),
    contact-info: (string-ascii 200),
    preferred-communication: (string-ascii 50),
    registration-date: uint
  }
)

;; Map to store tool feedback
(define-map tool-feedback
  { id: uint }
  {
    user-id: uint,
    design-id: uint,
    contract-id: uint,
    usability-rating: uint,
    effectiveness-rating: uint,
    comfort-rating: uint,
    durability-rating: uint,
    comments: (string-ascii 500),
    usage-duration-days: uint,
    usage-frequency: (string-ascii 50),
    submission-date: uint
  }
)

;; Map to store professional assessments
(define-map professional-assessments
  { id: uint }
  {
    assessor: principal,
    design-id: uint,
    user-id: uint,
    assessment-type: (string-ascii 50),
    findings: (string-ascii 500),
    recommendations: (string-ascii 500),
    assessment-date: uint,
    follow-up-needed: bool
  }
)

;; Map to store improvement suggestions
(define-map improvement-suggestions
  { id: uint }
  {
    design-id: uint,
    suggested-by: principal,
    suggestion-type: (string-ascii 50),
    description: (string-ascii 500),
    expected-benefits: (string-ascii 200),
    implementation-difficulty: (string-ascii 20),
    submission-date: uint
  }
)

;; Get the last assigned user ID
(define-read-only (get-last-user-id)
  (ok (var-get last-user-id))
)

;; Get user details by ID
(define-read-only (get-user (id uint))
  (map-get? users { id: id })
)

;; Register as a user
(define-public (register-user
    (name (string-ascii 100))
    (disability-type (string-ascii 100))
    (specific-needs (string-ascii 500))
    (contact-info (string-ascii 200))
    (preferred-communication (string-ascii 50)))
  (let
    ((new-id (+ (var-get last-user-id) u1)))
    (var-set last-user-id new-id)
    (map-set users { id: new-id } {
      owner: tx-sender,
      name: name,
      disability-type: disability-type,
      specific-needs: specific-needs,
      contact-info: contact-info,
      preferred-communication: preferred-communication,
      registration-date: block-height
    })
    (ok new-id)
  )
)

;; Update user information
(define-public (update-user
    (id uint)
    (specific-needs (string-ascii 500))
    (contact-info (string-ascii 200))
    (preferred-communication (string-ascii 50)))
  (let ((user-data (map-get? users { id: id })))
    (match user-data
      user (if (is-eq tx-sender (get owner user))
        (begin
          (map-set users { id: id } {
            owner: (get owner user),
            name: (get name user),
            disability-type: (get disability-type user),
            specific-needs: specific-needs,
            contact-info: contact-info,
            preferred-communication: preferred-communication,
            registration-date: (get registration-date user)
          })
          (ok id)
        )
        (err u403))
      (err u404)
    )
  )
)

;; Submit tool feedback
(define-public (submit-feedback
    (user-id uint)
    (design-id uint)
    (contract-id uint)
    (usability-rating uint)
    (effectiveness-rating uint)
    (comfort-rating uint)
    (durability-rating uint)
    (comments (string-ascii 500))
    (usage-duration-days uint)
    (usage-frequency (string-ascii 50)))
  (let ((user-data (map-get? users { id: user-id })))
    (match user-data
      user (if (is-eq tx-sender (get owner user))
        (let ((new-id (+ (var-get last-feedback-id) u1)))
          (var-set last-feedback-id new-id)
          (map-set tool-feedback { id: new-id } {
            user-id: user-id,
            design-id: design-id,
            contract-id: contract-id,
            usability-rating: usability-rating,
            effectiveness-rating: effectiveness-rating,
            comfort-rating: comfort-rating,
            durability-rating: durability-rating,
            comments: comments,
            usage-duration-days: usage-duration-days,
            usage-frequency: usage-frequency,
            submission-date: block-height
          })
          (ok new-id)
        )
        (err u403))
      (err u404)
    )
  )
)

;; Get feedback details by ID
(define-read-only (get-feedback (id uint))
  (map-get? tool-feedback { id: id })
)

;; Submit professional assessment
(define-public (submit-assessment
    (design-id uint)
    (user-id uint)
    (assessment-type (string-ascii 50))
    (findings (string-ascii 500))
    (recommendations (string-ascii 500))
    (follow-up-needed bool))
  (let
    ((new-id (+ (var-get last-assessment-id) u1)))
    (var-set last-assessment-id new-id)
    (map-set professional-assessments { id: new-id } {
      assessor: tx-sender,
      design-id: design-id,
      user-id: user-id,
      assessment-type: assessment-type,
      findings: findings,
      recommendations: recommendations,
      assessment-date: block-height,
      follow-up-needed: follow-up-needed
    })
    (ok new-id)
  )
)

;; Get assessment details by ID
(define-read-only (get-assessment (id uint))
  (map-get? professional-assessments { id: id })
)

;; Submit improvement suggestion
(define-public (submit-improvement
    (design-id uint)
    (suggestion-type (string-ascii 50))
    (description (string-ascii 500))
    (expected-benefits (string-ascii 200))
    (implementation-difficulty (string-ascii 20)))
  (let
    ((new-id (+ (var-get last-improvement-id) u1)))
    (var-set last-improvement-id new-id)
    (map-set improvement-suggestions { id: new-id } {
      design-id: design-id,
      suggested-by: tx-sender,
      suggestion-type: suggestion-type,
      description: description,
      expected-benefits: expected-benefits,
      implementation-difficulty: implementation-difficulty,
      submission-date: block-height
    })
    (ok new-id)
  )
)

;; Get improvement suggestion details by ID
(define-read-only (get-improvement (id uint))
  (map-get? improvement-suggestions { id: id })
)

;; Calculate average ratings for a design - simplified version
(define-read-only (get-average-ratings (design-id uint))
  ;; In a real implementation, this would calculate averages from all feedback
  ;; For simplicity, we return placeholder values
  (ok {
    usability: u0,
    effectiveness: u0,
    comfort: u0,
    durability: u0,
    overall: u0,
    feedback-count: u0
  })
)

;; Get all feedback for a design - simplified version
(define-read-only (get-feedback-by-design (design-id uint))
  ;; In a real implementation, this would filter feedback by design-id
  ;; For simplicity, we return an empty list
  (ok (list))
)

;; Get all assessments for a user - simplified version
(define-read-only (get-assessments-by-user (user-id uint))
  ;; In a real implementation, this would filter assessments by user-id
  ;; For simplicity, we return an empty list
  (ok (list))
)

;; Get all improvement suggestions for a design - simplified version
(define-read-only (get-improvements-by-design (design-id uint))
  ;; In a real implementation, this would filter improvements by design-id
  ;; For simplicity, we return an empty list
  (ok (list))
)

