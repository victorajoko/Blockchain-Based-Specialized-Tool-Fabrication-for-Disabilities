;; Material Sourcing Contract
;; Tracks components used in custom tools

;; Define data variables
(define-data-var last-material-id uint u0)
(define-data-var last-supplier-id uint u0)
(define-data-var last-inventory-id uint u0)
(define-data-var last-usage-id uint u0)

;; Map to store materials
(define-map materials
  { id: uint }
  {
    name: (string-ascii 100),
    category: (string-ascii 50),
    description: (string-ascii 500),
    properties: (string-ascii 200),
    safety-info: (string-ascii 200),
    typical-uses: (string-ascii 200),
    added-by: principal,
    added-at: uint
  }
)

;; Map to store suppliers
(define-map suppliers
  { id: uint }
  {
    owner: principal,
    name: (string-ascii 100),
    contact-info: (string-ascii 200),
    location: (string-ascii 100),
    specialties: (string-ascii 200),
    certification: (string-ascii 200),
    reliability-rating: uint,
    registration-date: uint
  }
)

;; Map to store material inventory
(define-map material-inventory
  { id: uint }
  {
    material-id: uint,
    supplier-id: uint,
    quantity: uint,
    unit: (string-ascii 20),
    batch-number: (string-ascii 50),
    acquisition-date: uint,
    expiration-date: uint,
    storage-location: (string-ascii 100),
    cost-per-unit: uint,
    quality-grade: (string-ascii 20),
    recorded-by: principal
  }
)

;; Map to store material usage
(define-map material-usage
  { id: uint }
  {
    inventory-id: uint,
    contract-id: uint,
    design-id: uint,
    quantity-used: uint,
    usage-date: uint,
    purpose: (string-ascii 200),
    recorded-by: principal
  }
)

;; Map to store material certifications
(define-map material-certifications
  { material-id: uint, certification-type: (string-ascii 50) }
  {
    certification-body: (string-ascii 100),
    certification-date: uint,
    expiration-date: uint,
    certification-details: (string-ascii 200),
    verification-link: (string-ascii 200)
  }
)

;; Get the last assigned material ID
(define-read-only (get-last-material-id)
  (ok (var-get last-material-id))
)

;; Get material details by ID
(define-read-only (get-material (id uint))
  (map-get? materials { id: id })
)

;; Register a new material
(define-public (register-material
    (name (string-ascii 100))
    (category (string-ascii 50))
    (description (string-ascii 500))
    (properties (string-ascii 200))
    (safety-info (string-ascii 200))
    (typical-uses (string-ascii 200)))
  (let
    ((new-id (+ (var-get last-material-id) u1)))
    (var-set last-material-id new-id)
    (map-set materials { id: new-id } {
      name: name,
      category: category,
      description: description,
      properties: properties,
      safety-info: safety-info,
      typical-uses: typical-uses,
      added-by: tx-sender,
      added-at: block-height
    })
    (ok new-id)
  )
)

;; Update material information
(define-public (update-material
    (id uint)
    (description (string-ascii 500))
    (properties (string-ascii 200))
    (safety-info (string-ascii 200))
    (typical-uses (string-ascii 200)))
  (let ((material-data (map-get? materials { id: id })))
    (match material-data
      material (if (is-eq tx-sender (get added-by material))
        (begin
          (map-set materials { id: id } {
            name: (get name material),
            category: (get category material),
            description: description,
            properties: properties,
            safety-info: safety-info,
            typical-uses: typical-uses,
            added-by: (get added-by material),
            added-at: (get added-at material)
          })
          (ok id)
        )
        (err u403))
      (err u404)
    )
  )
)

;; Register as a supplier
(define-public (register-supplier
    (name (string-ascii 100))
    (contact-info (string-ascii 200))
    (location (string-ascii 100))
    (specialties (string-ascii 200))
    (certification (string-ascii 200))
    (reliability-rating uint))
  (let
    ((new-id (+ (var-get last-supplier-id) u1)))
    (var-set last-supplier-id new-id)
    (map-set suppliers { id: new-id } {
      owner: tx-sender,
      name: name,
      contact-info: contact-info,
      location: location,
      specialties: specialties,
      certification: certification,
      reliability-rating: reliability-rating,
      registration-date: block-height
    })
    (ok new-id)
  )
)

;; Get supplier details by ID
(define-read-only (get-supplier (id uint))
  (map-get? suppliers { id: id })
)

;; Add material inventory
(define-public (add-inventory
    (material-id uint)
    (supplier-id uint)
    (quantity uint)
    (unit (string-ascii 20))
    (batch-number (string-ascii 50))
    (expiration-date uint)
    (storage-location (string-ascii 100))
    (cost-per-unit uint)
    (quality-grade (string-ascii 20)))
  (let
    ((new-id (+ (var-get last-inventory-id) u1)))
    (var-set last-inventory-id new-id)
    (map-set material-inventory { id: new-id } {
      material-id: material-id,
      supplier-id: supplier-id,
      quantity: quantity,
      unit: unit,
      batch-number: batch-number,
      acquisition-date: block-height,
      expiration-date: expiration-date,
      storage-location: storage-location,
      cost-per-unit: cost-per-unit,
      quality-grade: quality-grade,
      recorded-by: tx-sender
    })
    (ok new-id)
  )
)

;; Get inventory details by ID
(define-read-only (get-inventory (id uint))
  (map-get? material-inventory { id: id })
)

;; Record material usage
(define-public (record-usage
    (inventory-id uint)
    (contract-id uint)
    (design-id uint)
    (quantity-used uint)
    (purpose (string-ascii 200)))
  (let ((inventory-data (map-get? material-inventory { id: inventory-id })))
    (match inventory-data
      inventory (if (>= (get quantity inventory) quantity-used)
        (let ((new-id (+ (var-get last-usage-id) u1)))
          (var-set last-usage-id new-id)
          ;; Update inventory quantity
          (map-set material-inventory { id: inventory-id } {
            material-id: (get material-id inventory),
            supplier-id: (get supplier-id inventory),
            quantity: (- (get quantity inventory) quantity-used),
            unit: (get unit inventory),
            batch-number: (get batch-number inventory),
            acquisition-date: (get acquisition-date inventory),
            expiration-date: (get expiration-date inventory),
            storage-location: (get storage-location inventory),
            cost-per-unit: (get cost-per-unit inventory),
            quality-grade: (get quality-grade inventory),
            recorded-by: (get recorded-by inventory)
          })
          ;; Record usage
          (map-set material-usage { id: new-id } {
            inventory-id: inventory-id,
            contract-id: contract-id,
            design-id: design-id,
            quantity-used: quantity-used,
            usage-date: block-height,
            purpose: purpose,
            recorded-by: tx-sender
          })
          (ok new-id)
        )
        (err u400)) ;; Not enough inventory
      (err u404)
    )
  )
)

;; Get usage details by ID
(define-read-only (get-usage (id uint))
  (map-get? material-usage { id: id })
)

;; Add material certification
(define-public (add-material-certification
    (material-id uint)
    (certification-type (string-ascii 50))
    (certification-body (string-ascii 100))
    (expiration-date uint)
    (certification-details (string-ascii 200))
    (verification-link (string-ascii 200)))
  (let ((material-data (map-get? materials { id: material-id })))
    (match material-data
      material (begin
        (map-set material-certifications { material-id: material-id, certification-type: certification-type } {
          certification-body: certification-body,
          certification-date: block-height,
          expiration-date: expiration-date,
          certification-details: certification-details,
          verification-link: verification-link
        })
        (ok { material-id: material-id, certification-type: certification-type })
      )
      (err u404)
    )
  )
)

;; Get material certification
(define-read-only (get-material-certification (material-id uint) (certification-type (string-ascii 50)))
  (map-get? material-certifications { material-id: material-id, certification-type: certification-type })
)

;; Find materials by category - simplified version
(define-read-only (find-materials-by-category (category (string-ascii 50)))
  ;; In a real implementation, this would filter materials by category
  ;; For simplicity, we return an empty list
  (ok (list))
)

;; Get inventory by material - simplified version
(define-read-only (get-inventory-by-material (material-id uint))
  ;; In a real implementation, this would filter inventory by material-id
  ;; For simplicity, we return an empty list
  (ok (list))
)

;; Get usage history for a design - simplified version
(define-read-only (get-usage-by-design (design-id uint))
  ;; In a real implementation, this would filter usage by design-id
  ;; For simplicity, we return an empty list
  (ok (list))
)

