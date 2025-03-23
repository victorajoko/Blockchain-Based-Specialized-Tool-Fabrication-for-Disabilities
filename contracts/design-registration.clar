;; Design Registration Contract
;; Records specifications for adaptive tools

;; Define data variables
(define-data-var last-design-id uint u0)
(define-data-var last-feature-id uint u0)
(define-data-var last-attachment-id uint u0)

;; Map to store tool designs
(define-map tool-designs
  { id: uint }
  {
    owner: principal,
    name: (string-ascii 100),
    description: (string-ascii 500),
    disability-type: (string-ascii 100),
    use-case: (string-ascii 200),
    dimensions: (string-ascii 100),
    weight-grams: uint,
    ergonomic-features: (string-ascii 200),
    customization-options: (string-ascii 200),
    registration-date: uint
  }
)

;; Map to store design features
(define-map design-features
  { design-id: uint, feature-id: uint }
  {
    name: (string-ascii 100),
    description: (string-ascii 500),
    importance: (string-ascii 20),
    technical-requirements: (string-ascii 200)
  }
)

;; Map to store design attachments (documentation, images, 3D models)
(define-map design-attachments
  { id: uint }
  {
    design-id: uint,
    attachment-type: (string-ascii 50),
    description: (string-ascii 200),
    content-hash: (string-ascii 64),
    file-format: (string-ascii 20),
    added-by: principal,
    added-at: uint
  }
)

;; Map to store design versions
(define-map design-versions
  { design-id: uint, version: uint }
  {
    changes: (string-ascii 500),
    version-date: uint,
    created-by: principal
  }
)

;; Get the last assigned design ID
(define-read-only (get-last-design-id)
  (ok (var-get last-design-id))
)

;; Get design details by ID
(define-read-only (get-design (id uint))
  (map-get? tool-designs { id: id })
)

;; Register a new tool design
(define-public (register-design
    (name (string-ascii 100))
    (description (string-ascii 500))
    (disability-type (string-ascii 100))
    (use-case (string-ascii 200))
    (dimensions (string-ascii 100))
    (weight-grams uint)
    (ergonomic-features (string-ascii 200))
    (customization-options (string-ascii 200)))
  (let
    ((new-id (+ (var-get last-design-id) u1)))
    (var-set last-design-id new-id)
    (map-set tool-designs { id: new-id } {
      owner: tx-sender,
      name: name,
      description: description,
      disability-type: disability-type,
      use-case: use-case,
      dimensions: dimensions,
      weight-grams: weight-grams,
      ergonomic-features: ergonomic-features,
      customization-options: customization-options,
      registration-date: block-height
    })
    (ok new-id)
  )
)

;; Update design information
(define-public (update-design
    (id uint)
    (description (string-ascii 500))
    (dimensions (string-ascii 100))
    (weight-grams uint)
    (ergonomic-features (string-ascii 200))
    (customization-options (string-ascii 200)))
  (let ((design-data (map-get? tool-designs { id: id })))
    (match design-data
      design (if (is-eq tx-sender (get owner design))
        (begin
          (map-set tool-designs { id: id } {
            owner: (get owner design),
            name: (get name design),
            description: description,
            disability-type: (get disability-type design),
            use-case: (get use-case design),
            dimensions: dimensions,
            weight-grams: weight-grams,
            ergonomic-features: ergonomic-features,
            customization-options: customization-options,
            registration-date: (get registration-date design)
          })
          (ok id)
        )
        (err u403))
      (err u404)
    )
  )
)

;; Add a feature to a design
(define-public (add-design-feature
    (design-id uint)
    (name (string-ascii 100))
    (description (string-ascii 500))
    (importance (string-ascii 20))
    (technical-requirements (string-ascii 200)))
  (let ((design-data (map-get? tool-designs { id: design-id })))
    (match design-data
      design (if (is-eq tx-sender (get owner design))
        (let ((new-id (+ (var-get last-feature-id) u1)))
          (var-set last-feature-id new-id)
          (map-set design-features { design-id: design-id, feature-id: new-id } {
            name: name,
            description: description,
            importance: importance,
            technical-requirements: technical-requirements
          })
          (ok { design-id: design-id, feature-id: new-id })
        )
        (err u403))
      (err u404)
    )
  )
)

;; Get a specific feature for a design
(define-read-only (get-design-feature (design-id uint) (feature-id uint))
  (map-get? design-features { design-id: design-id, feature-id: feature-id })
)

;; Add an attachment to a design
(define-public (add-design-attachment
    (design-id uint)
    (attachment-type (string-ascii 50))
    (description (string-ascii 200))
    (content-hash (string-ascii 64))
    (file-format (string-ascii 20)))
  (let ((design-data (map-get? tool-designs { id: design-id })))
    (match design-data
      design (
        let ((new-id (+ (var-get last-attachment-id) u1)))
          (var-set last-attachment-id new-id)
          (map-set design-attachments { id: new-id } {
            design-id: design-id,
            attachment-type: attachment-type,
            description: description,
            content-hash: content-hash,
            file-format: file-format,
            added-by: tx-sender,
            added-at: block-height
          })
          (ok new-id)
      )
      (err u404)
    )
  )
)

;; Get attachment details by ID
(define-read-only (get-design-attachment (id uint))
  (map-get? design-attachments { id: id })
)

;; Create a new version of a design
(define-public (create-design-version
    (design-id uint)
    (version uint)
    (changes (string-ascii 500)))
  (let ((design-data (map-get? tool-designs { id: design-id })))
    (match design-data
      design (if (is-eq tx-sender (get owner design))
        (begin
          (map-set design-versions { design-id: design-id, version: version } {
            changes: changes,
            version-date: block-height,
            created-by: tx-sender
          })
          (ok { design-id: design-id, version: version })
        )
        (err u403))
      (err u404)
    )
  )
)

;; Get version details
(define-read-only (get-design-version (design-id uint) (version uint))
  (map-get? design-versions { design-id: design-id, version: version })
)

;; Get all attachments for a design - simplified version
(define-read-only (get-design-attachments (design-id uint))
  ;; In a real implementation, this would filter attachments by design-id
  ;; For simplicity, we return an empty list
  (ok (list))
)

;; Search designs by disability type - simplified version
(define-read-only (search-designs-by-disability (disability-type (string-ascii 100)))
  ;; In a real implementation, this would filter designs by disability-type
  ;; For simplicity, we return an empty list
  (ok (list))
)

