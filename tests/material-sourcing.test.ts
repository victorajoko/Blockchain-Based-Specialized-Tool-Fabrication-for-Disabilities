import { describe, it, expect, beforeEach } from "vitest"

// Mock implementation for testing Clarity contracts
const mockPrincipal = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const mockBlockHeight = 100

// Mock state
let lastMaterialId = 0
let lastSupplierId = 0
let lastInventoryId = 0
let lastUsageId = 0
const materials = new Map()
const suppliers = new Map()
const materialInventory = new Map()
const materialUsage = new Map()
const materialCertifications = new Map()

// Mock contract functions
const registerMaterial = (name, category, description, properties, safetyInfo, typicalUses) => {
  const newId = lastMaterialId + 1
  lastMaterialId = newId
  
  materials.set(newId, {
    name,
    category,
    description,
    properties,
    safetyInfo,
    typicalUses,
    addedBy: mockPrincipal,
    addedAt: mockBlockHeight,
  })
  
  return { value: newId }
}

const getMaterial = (id) => {
  const material = materials.get(id)
  return material ? material : null
}

const updateMaterial = (id, description, properties, safetyInfo, typicalUses) => {
  const material = materials.get(id)
  if (!material) return { error: 404 }
  if (material.addedBy !== mockPrincipal) return { error: 403 }
  
  materials.set(id, {
    ...material,
    description,
    properties,
    safetyInfo,
    typicalUses,
  })
  
  return { value: id }
}

const registerSupplier = (name, contactInfo, location, specialties, certification, reliabilityRating) => {
  const newId = lastSupplierId + 1
  lastSupplierId = newId
  
  suppliers.set(newId, {
    owner: mockPrincipal,
    name,
    contactInfo,
    location,
    specialties,
    certification,
    reliabilityRating,
    registrationDate: mockBlockHeight,
  })
  
  return { value: newId }
}

const getSupplier = (id) => {
  const supplier = suppliers.get(id)
  return supplier ? supplier : null
}

const addInventory = (
    materialId,
    supplierId,
    quantity,
    unit,
    batchNumber,
    expirationDate,
    storageLocation,
    costPerUnit,
    qualityGrade,
) => {
  const newId = lastInventoryId + 1
  lastInventoryId = newId
  
  materialInventory.set(newId, {
    materialId,
    supplierId,
    quantity,
    unit,
    batchNumber,
    acquisitionDate: mockBlockHeight,
    expirationDate,
    storageLocation,
    costPerUnit,
    qualityGrade,
    recordedBy: mockPrincipal,
  })
  
  return { value: newId }
}

const getInventory = (id) => {
  const inventory = materialInventory.get(id)
  return inventory ? inventory : null
}

const recordUsage = (inventoryId, contractId, designId, quantityUsed, purpose) => {
  const inventory = materialInventory.get(inventoryId)
  if (!inventory) return { error: 404 }
  if (inventory.quantity < quantityUsed) return { error: 400 }
  
  // Update inventory quantity
  materialInventory.set(inventoryId, {
    ...inventory,
    quantity: inventory.quantity - quantityUsed,
  })
  
  const newId = lastUsageId + 1
  lastUsageId = newId
  
  materialUsage.set(newId, {
    inventoryId,
    contractId,
    designId,
    quantityUsed,
    usageDate: mockBlockHeight,
    purpose,
    recordedBy: mockPrincipal,
  })
  
  return { value: newId }
}

const getUsage = (id) => {
  const usage = materialUsage.get(id)
  return usage ? usage : null
}

const addMaterialCertification = (
    materialId,
    certificationType,
    certificationBody,
    expirationDate,
    certificationDetails,
    verificationLink,
) => {
  const material = materials.get(materialId)
  if (!material) return { error: 404 }
  
  const key = `${materialId}-${certificationType}`
  materialCertifications.set(key, {
    certificationBody,
    certificationDate: mockBlockHeight,
    expirationDate,
    certificationDetails,
    verificationLink,
  })
  
  return { value: { materialId, certificationType } }
}

const getMaterialCertification = (materialId, certificationType) => {
  const key = `${materialId}-${certificationType}`
  const certification = materialCertifications.get(key)
  return certification ? certification : null
}

describe("Material Sourcing Contract", () => {
  beforeEach(() => {
    // Reset state before each test
    lastMaterialId = 0
    lastSupplierId = 0
    lastInventoryId = 0
    lastUsageId = 0
    materials.clear()
    suppliers.clear()
    materialInventory.clear()
    materialUsage.clear()
    materialCertifications.clear()
  })
  
  it("should register a new material", () => {
    const result = registerMaterial(
        "Medical-Grade Silicone",
        "Polymer",
        "Flexible, biocompatible silicone for medical applications",
        "Hypoallergenic, flexible, heat-resistant up to 200°C",
        "FDA approved for skin contact, non-toxic",
        "Grips, cushioning, seals, adaptive handles",
    )
    
    expect(result.value).toBe(1)
    expect(materials.size).toBe(1)
    
    const material = getMaterial(1)
    expect(material).not.toBeNull()
    expect(material.name).toBe("Medical-Grade Silicone")
    expect(material.category).toBe("Polymer")
    expect(material.properties).toBe("Hypoallergenic, flexible, heat-resistant up to 200°C")
    expect(material.safetyInfo).toBe("FDA approved for skin contact, non-toxic")
  })
  
  it("should update material information", () => {
    // First register a material
    registerMaterial(
        "Medical-Grade Silicone",
        "Polymer",
        "Flexible, biocompatible silicone for medical applications",
        "Hypoallergenic, flexible, heat-resistant up to 200°C",
        "FDA approved for skin contact, non-toxic",
        "Grips, cushioning, seals, adaptive handles",
    )
    
    // Then update it
    const updateResult = updateMaterial(
        1,
        "Flexible, biocompatible silicone for medical and assistive device applications",
        "Hypoallergenic, flexible, heat-resistant up to 250°C, tear-resistant",
        "FDA approved for skin contact, non-toxic, passed ISO 10993 biocompatibility tests",
        "Grips, cushioning, seals, adaptive handles, prosthetic interfaces",
    )
    
    expect(updateResult.value).toBe(1)
    
    const material = getMaterial(1)
    expect(material.description).toContain("assistive device applications")
    expect(material.properties).toContain("tear-resistant")
    expect(material.safetyInfo).toContain("ISO 10993")
    expect(material.typicalUses).toContain("prosthetic interfaces")
  })
  
  it("should register a supplier", () => {
    const result = registerSupplier(
        "MedTech Materials",
        "contact@medtechmaterials.com, 555-123-4567",
        "Boston, MA",
        "Medical-grade polymers, biocompatible metals",
        "ISO 13485 certified, FDA registered facility",
        95,
    )
    
    expect(result.value).toBe(1)
    expect(suppliers.size).toBe(1)
    
    const supplier = getSupplier(1)
    expect(supplier).not.toBeNull()
    expect(supplier.name).toBe("MedTech Materials")
    expect(supplier.location).toBe("Boston, MA")
    expect(supplier.specialties).toBe("Medical-grade polymers, biocompatible metals")
    expect(supplier.certification).toBe("ISO 13485 certified, FDA registered facility")
    expect(supplier.reliabilityRating).toBe(95)
  })
  
  it("should add material inventory", () => {
    // First register material and supplier
    registerMaterial(
        "Medical-Grade Silicone",
        "Polymer",
        "Flexible, biocompatible silicone for medical applications",
        "Hypoallergenic, flexible, heat-resistant up to 200°C",
        "FDA approved for skin contact, non-toxic",
        "Grips, cushioning, seals, adaptive handles",
    )
    
    registerSupplier(
        "MedTech Materials",
        "contact@medtechmaterials.com, 555-123-4567",
        "Boston, MA",
        "Medical-grade polymers, biocompatible metals",
        "ISO 13485 certified, FDA registered facility",
        95,
    )
    
    // Then add inventory
    const result = addInventory(
        1, // material ID
        1, // supplier ID
        5000, // quantity
        "grams", // unit
        "SIL-2023-05-15-001", // batch number
        mockBlockHeight + 31536000, // expiration date (1 year)
        "Warehouse A, Shelf 3B",
        25, // cost per unit (cents per gram)
        "Medical",
    )
    
    expect(result.value).toBe(1)
    expect(materialInventory.size).toBe(1)
    
    const inventory = getInventory(1)
    expect(inventory).not.toBeNull()
    expect(inventory.materialId).toBe(1)
    expect(inventory.supplierId).toBe(1)
    expect(inventory.quantity).toBe(5000)
    expect(inventory.unit).toBe("grams")
    expect(inventory.batchNumber).toBe("SIL-2023-05-15-001")
    expect(inventory.qualityGrade).toBe("Medical")
  })
  
  it("should record material usage", () => {
    // Setup material, supplier, and inventory
    registerMaterial(
        "Medical-Grade Silicone",
        "Polymer",
        "Flexible, biocompatible silicone for medical applications",
        "Hypoallergenic, flexible, heat-resistant up to 200°C",
        "FDA approved for skin contact, non-toxic",
        "Grips, cushioning, seals, adaptive handles",
    )
    
    registerSupplier(
        "MedTech Materials",
        "contact@medtechmaterials.com, 555-123-4567",
        "Boston, MA",
        "Medical-grade polymers, biocompatible metals",
        "ISO 13485 certified, FDA registered facility",
        95,
    )
    
    addInventory(
        1, // material ID
        1, // supplier ID
        5000, // quantity
        "grams", // unit
        "SIL-2023-05-15-001", // batch number
        mockBlockHeight + 31536000, // expiration date (1 year)
        "Warehouse A, Shelf 3B",
        25, // cost per unit (cents per gram)
        "Medical",
    )
    
    // Record usage
    const result = recordUsage(
        1, // inventory ID
        1, // contract ID
        1, // design ID
        250, // quantity used
        "Grip coating for adaptive utensil holder",
    )
    
    expect(result.value).toBe(1)
    expect(materialUsage.size).toBe(1)
    
    // Check that inventory was updated
    const inventory = getInventory(1)
    expect(inventory.quantity).toBe(4750) // 5000 - 250
    
    const usage = getUsage(1)
    expect(usage).not.toBeNull()
    expect(usage.inventoryId).toBe(1)
    expect(usage.designId).toBe(1)
    expect(usage.quantityUsed).toBe(250)
    expect(usage.purpose).toBe("Grip coating for adaptive utensil holder")
  })
  
  it("should add material certifications", () => {
    // First register a material
    registerMaterial(
        "Medical-Grade Silicone",
        "Polymer",
        "Flexible, biocompatible silicone for medical applications",
        "Hypoallergenic, flexible, heat-resistant up to 200°C",
        "FDA approved for skin contact, non-toxic",
        "Grips, cushioning, seals, adaptive handles",
    )
    
    // Add certification
    const result = addMaterialCertification(
        1, // material ID
        "Biocompatibility",
        "TÜV SÜD",
        mockBlockHeight + 63072000, // expiration date (2 years)
        "Passed ISO 10993-5 and ISO 10993-10 tests for cytotoxicity and skin irritation",
        "https://certification.example.com/12345",
    )
    
    expect(result.value).toEqual({ materialId: 1, certificationType: "Biocompatibility" })
    
    const certification = getMaterialCertification(1, "Biocompatibility")
    expect(certification).not.toBeNull()
    expect(certification.certificationBody).toBe("TÜV SÜD")
    expect(certification.certificationDetails).toContain("ISO 10993-5")
    expect(certification.verificationLink).toBe("https://certification.example.com/12345")
  })
})

