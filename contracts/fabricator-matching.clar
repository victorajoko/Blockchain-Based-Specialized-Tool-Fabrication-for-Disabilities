;; Fabricator Matching Contract
;; Connects needs with appropriate makers

;; Define data variables
(define-data-var last-fabricator-id uint u0)
(define-data-var last-request-id uint u0)
(define-data-var last-proposal-id uint u0)
(define-data-var last-contract-id uint u0)

;; Map to store fabricator profiles
(define-map fabricators
  { id: uint }
  {
    owner: principal,
    name: (string-ascii 100),
    expertise: (string-ascii 200),
    equipment: (string-ascii 200),
    materials-handled: (string-ascii 200),
    location: (string-ascii 100),
    capacity-per-month: uint,
    certification: (string-ascii 200),
    registration-date: uint
  }
)

;; Map to store fabrication requests
(define-map fabrication-requests
  { id: uint }
  {
    requester: principal,
    design-id: uint,
    quantity: uint,
    deadline: uint,
    budget: uint,
    special-requirements: (string-ascii 500),
    status: (string-ascii 20),
    request-date: uint
  }
)

;; Map to store fabrication proposals
(define-map fabrication-proposals
  { id: uint }
  {
    request-id: uint,
    fabricator-id: uint,
    estimated-cost: uint,
    estimated-completion: uint,
    approach: (string-ascii 500),
    materials-proposed: (string-ascii 200),
    status: (string-ascii 20),
    proposal-date: uint
  }
)

;; Map to store fabrication contracts
(define-map fabrication-contracts
  { id: uint }
  {
    request-id: uint,
    proposal-id: uint,
    requester: principal,
    fabricator: principal,
    agreed-cost: uint,
    agreed-deadline: uint,
    payment-terms: (string-ascii 200),
    status: (string-ascii 20),
    creation-date: uint
  }
)

;; Get the last assigned fabricator ID
(define-read-only (get-last-fabricator-id)
  (ok (var-get last-fabricator-id))
)

;; Get fabricator details by ID
(define-read-only (get-fabricator (id uint))
  (map-get? fabricators { id: id })
)

;; Register as a fabricator
(define-public (register-fabricator
    (name (string-ascii 100))
    (expertise (string-ascii 200))
    (equipment (string-ascii 200))
    (materials-handled (string-ascii 200))
    (location (string-ascii 100))
    (capacity-per-month uint)
    (certification (string-ascii 200)))
  (let
    ((new-id (+ (var-get last-fabricator-id) u1)))
    (var-set last-fabricator-id new-id)
    (map-set fabricators { id: new-id } {
      owner: tx-sender,
      name: name,
      expertise: expertise,
      equipment: equipment,
      materials-handled: materials-handled,
      location: location,
      capacity-per-month: capacity-per-month,
      certification: certification,
      registration-date: block-height
    })
    (ok new-id)
  )
)

;; Update fabricator information
(define-public (update-fabricator
    (id uint)
    (expertise (string-ascii 200))
    (equipment (string-ascii 200))
    (materials-handled (string-ascii 200))
    (location (string-ascii 100))
    (capacity-per-month uint)
    (certification (string-ascii 200)))
  (let ((fabricator-data (map-get? fabricators { id: id })))
    (match fabricator-data
      fabricator (if (is-eq tx-sender (get owner fabricator))
        (begin
          (map-set fabricators { id: id } {
            owner: (get owner fabricator),
            name: (get name fabricator),
            expertise: expertise,
            equipment: equipment,
            materials-handled: materials-handled,
            location: location,
            capacity-per-month: capacity-per-month,
            certification: certification,
            registration-date: (get registration-date fabricator)
          })
          (ok id)
        )
        (err u403))
      (err u404)
    )
  )
)

;; Create a fabrication request
(define-public (create-request
    (design-id uint)
    (quantity uint)
    (deadline uint)
    (budget uint)
    (special-requirements (string-ascii 500)))
  (let
    ((new-id (+ (var-get last-request-id) u1)))
    (var-set last-request-id new-id)
    (map-set fabrication-requests { id: new-id } {
      requester: tx-sender,
      design-id: design-id,
      quantity: quantity,
      deadline: deadline,
      budget: budget,
      special-requirements: special-requirements,
      status: "open",
      request-date: block-height
    })
    (ok new-id)
  )
)

;; Get request details by ID
(define-read-only (get-request (id uint))
  (map-get? fabrication-requests { id: id })
)

;; Update request status
(define-public (update-request-status
    (id uint)
    (status (string-ascii 20)))
  (let ((request-data (map-get? fabrication-requests { id: id })))
    (match request-data
      request (if (is-eq tx-sender (get requester request))
        (begin
          (map-set fabrication-requests { id: id } {
            requester: (get requester request),
            design-id: (get design-id request),
            quantity: (get quantity request),
            deadline: (get deadline request),
            budget: (get budget request),
            special-requirements: (get special-requirements request),
            status: status,
            request-date: (get request-date request)
          })
          (ok id)
        )
        (err u403))
      (err u404)
    )
  )
)

;; Submit a fabrication proposal
(define-public (submit-proposal
    (request-id uint)
    (fabricator-id uint)
    (estimated-cost uint)
    (estimated-completion uint)
    (approach (string-ascii 500))
    (materials-proposed (string-ascii 200)))
  (let ((fabricator-data (map-get? fabricators { id: fabricator-id })))
    (match fabricator-data
      fabricator (if (is-eq tx-sender (get owner fabricator))
        (let ((new-id (+ (var-get last-proposal-id) u1)))
          (var-set last-proposal-id new-id)
          (map-set fabrication-proposals { id: new-id } {
            request-id: request-id,
            fabricator-id: fabricator-id,
            estimated-cost: estimated-cost,
            estimated-completion: estimated-completion,
            approach: approach,
            materials-proposed: materials-proposed,
            status: "submitted",
            proposal-date: block-height
          })
          (ok new-id)
        )
        (err u403))
      (err u404)
    )
  )
)

;; Get proposal details by ID
(define-read-only (get-proposal (id uint))
  (map-get? fabrication-proposals { id: id })
)

;; Update proposal status
(define-public (update-proposal-status
    (id uint)
    (status (string-ascii 20)))
  (let ((proposal-data (map-get? fabrication-proposals { id: id })))
    (match proposal-data
      proposal (let ((fabricator-data (map-get? fabricators { id: (get fabricator-id proposal) })))
        (match fabricator-data
          fabricator (if (is-eq tx-sender (get owner fabricator))
            (begin
              (map-set fabrication-proposals { id: id } {
                request-id: (get request-id proposal),
                fabricator-id: (get fabricator-id proposal),
                estimated-cost: (get estimated-cost proposal),
                estimated-completion: (get estimated-completion proposal),
                approach: (get approach proposal),
                materials-proposed: (get materials-proposed proposal),
                status: status,
                proposal-date: (get proposal-date proposal)
              })
              (ok id)
            )
            (err u403))
          (err u404)
        )
      )
      (err u404)
    )
  )
)

;; Create a fabrication contract
(define-public (create-contract
    (request-id uint)
    (proposal-id uint)
    (agreed-cost uint)
    (agreed-deadline uint)
    (payment-terms (string-ascii 200)))
  (let ((request-data (map-get? fabrication-requests { id: request-id })))
    (match request-data
      request (if (is-eq tx-sender (get requester request))
        (let ((proposal-data (map-get? fabrication-proposals { id: proposal-id })))
          (match proposal-data
            proposal (let ((fabricator-data (map-get? fabricators { id: (get fabricator-id proposal) })))
              (match fabricator-data
                fabricator (let ((new-id (+ (var-get last-contract-id) u1)))
                  (var-set last-contract-id new-id)
                  (map-set fabrication-contracts { id: new-id } {
                    request-id: request-id,
                    proposal-id: proposal-id,
                    requester: (get requester request),
                    fabricator: (get owner fabricator),
                    agreed-cost: agreed-cost,
                    agreed-deadline: agreed-deadline,
                    payment-terms: payment-terms,
                    status: "active",
                    creation-date: block-height
                  })
                  (ok new-id)
                )
                (err u404)
              )
            )
            (err u404)
          )
        )
        (err u403))
      (err u404)
    )
  )
)

;; Get contract details by ID
(define-read-only (get-contract (id uint))
  (map-get? fabrication-contracts { id: id })
)

;; Update contract status
(define-public (update-contract-status
    (id uint)
    (status (string-ascii 20)))
  (let ((contract-data (map-get? fabrication-contracts { id: id })))
    (match contract-data
      contract (if (or (is-eq tx-sender (get requester contract)) (is-eq tx-sender (get fabricator contract)))
        (begin
          (map-set fabrication-contracts { id: id } {
            request-id: (get request-id contract),
            proposal-id: (get proposal-id contract),
            requester: (get requester contract),
            fabricator: (get fabricator contract),
            agreed-cost: (get agreed-cost contract),
            agreed-deadline: (get agreed-deadline contract),
            payment-terms: (get payment-terms contract),
            status: status,
            creation-date: (get creation-date contract)
          })
          (ok id)
        )
        (err u403))
      (err u404)
    )
  )
)

;; Find fabricators by expertise - simplified version
(define-read-only (find-fabricators-by-expertise (expertise (string-ascii 200)))
  ;; In a real implementation, this would filter fabricators by expertise
  ;; For simplicity, we return an empty list
  (ok (list))
)

;; Get open requests - simplified version
(define-read-only (get-open-requests)
  ;; In a real implementation, this would filter requests by status
  ;; For simplicity, we return an empty list
  (ok (list))
)

;; Get proposals for a request - simplified version
(define-read-only (get-proposals-for-request (request-id uint))
  ;; In a real implementation, this would filter proposals by request-id
  ;; For simplicity, we return an empty list
  (ok (list))
)

