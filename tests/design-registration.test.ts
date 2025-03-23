import { describe, it, expect, beforeEach } from "vitest"

// Mock implementation for testing Clarity contracts
const mockPrincipal = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const mockOtherPrincipal = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
const mockBlockHeight = 100

// Mock state
let lastDesignId = 0
let lastFeatureId = 0
let lastAttachmentId = 0
const toolDesigns = new Map()
const designFeatures = new Map()
const designAttachments = new Map()
const designVersions = new Map()

// Mock contract functions
const registerDesign = (
    name,
    description,
    disabilityType,
    useCase,
    dimensions,
    weightGrams,
    ergonomicFeatures,
    customizationOptions,
    owner = mockPrincipal,
) => {
  const newId = lastDesignId + 1
  lastDesignId = newId
  
  toolDesigns.set(newId, {
    owner,
    name,
    description,
    disabilityType,
    useCase,
    dimensions,
    weightGrams,
    ergonomicFeatures,
    customizationOptions,
    registrationDate: mockBlockHeight,
  })
  
  return { value: newId }
}

const getDesign = (id) => {
  const design = toolDesigns.get(id)
  return design ? design : null
}

const updateDesign = (
    id,
    description,
    dimensions,
    weightGrams,
    ergonomicFeatures,
    customizationOptions,
    owner = mockPrincipal,
) => {
  const design = toolDesigns.get(id)
  if (!design) return { error: 404 }
  if (design.owner !== owner) return { error: 403 }
  
  toolDesigns.set(id, {
    ...design,
    description,
    dimensions,
    weightGrams,
    ergonomicFeatures,
    customizationOptions,
  })
  
  return { value: id }
}

const addDesignFeature = (designId, name, description, importance, technicalRequirements, owner = mockPrincipal) => {
  const design = toolDesigns.get(designId)
  if (!design) return { error: 404 }
  if (design.owner !== owner) return { error: 403 }
  
  const newId = lastFeatureId + 1
  lastFeatureId = newId
  
  const key = `${designId}-${newId}`
  designFeatures.set(key, {
    name,
    description,
    importance,
    technicalRequirements,
  })
  
  return { value: { designId, featureId: newId } }
}

const getDesignFeature = (designId, featureId) => {
  const key = `${designId}-${featureId}`
  const feature = designFeatures.get(key)
  return feature ? feature : null
}

const addDesignAttachment = (designId, attachmentType, description, contentHash, fileFormat, owner = mockPrincipal) => {
  const design = toolDesigns.get(designId)
  if (!design) return { error: 404 }
  
  const newId = lastAttachmentId + 1
  lastAttachmentId = newId
  
  designAttachments.set(newId, {
    designId,
    attachmentType,
    description,
    contentHash,
    fileFormat,
    addedBy: owner,
    addedAt: mockBlockHeight,
  })
  
  return { value: newId }
}

const getDesignAttachment = (id) => {
  const attachment = designAttachments.get(id)
  return attachment ? attachment : null
}

const createDesignVersion = (designId, version, changes, owner = mockPrincipal) => {
  const design = toolDesigns.get(designId)
  if (!design) return { error: 404 }
  if (design.owner !== owner) return { error: 403 }
  
  const key = `${designId}-${version}`
  designVersions.set(key, {
    changes,
    versionDate: mockBlockHeight,
    createdBy: owner,
  })
  
  return { value: { designId, version } }
}

const getDesignVersion = (designId, version) => {
  const key = `${designId}-${version}`
  const versionData = designVersions.get(key)
  return versionData ? versionData : null
}

// Mock function to simulate searching designs by disability type
const searchDesignsByDisability = (disabilityType) => {
  const results = []
  for (const [id, design] of toolDesigns.entries()) {
    if (design.disabilityType.includes(disabilityType)) {
      results.push({ id, design })
    }
  }
  return { value: results }
}

// Mock function to get all attachments for a design
const getDesignAttachments = (designId) => {
  const results = []
  for (const [id, attachment] of designAttachments.entries()) {
    if (attachment.designId === designId) {
      results.push({ id, attachment })
    }
  }
  return { value: results }
}

describe("Design Registration Contract", () => {
  beforeEach(() => {
    // Reset state before each test
    lastDesignId = 0
    lastFeatureId = 0
    lastAttachmentId = 0
    toolDesigns.clear()
    designFeatures.clear()
    designAttachments.clear()
    designVersions.clear()
  })
  
  describe("Design Registration", () => {
    it("should register a new tool design", () => {
      const result = registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      expect(result.value).toBe(1)
      expect(toolDesigns.size).toBe(1)
      
      const design = getDesign(1)
      expect(design).not.toBeNull()
      expect(design.name).toBe("Adaptive Utensil Holder")
      expect(design.disabilityType).toBe("Limited hand mobility, arthritis")
      expect(design.weightGrams).toBe(75)
      expect(design.ergonomicFeatures).toBe("Ergonomic grip, adjustable strap, non-slip surface")
    })
    
    it("should register multiple designs with unique IDs", () => {
      registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      const result2 = registerDesign(
          "Button Fastening Aid",
          "Device to assist with buttoning clothing",
          "Limited dexterity, one-handed use",
          "Independent dressing",
          "15cm x 2cm x 1cm",
          45,
          "Extended handle, button hook, zipper pull",
          "Handle length, grip texture, hook size",
      )
      
      expect(result2.value).toBe(2)
      expect(toolDesigns.size).toBe(2)
      
      const design2 = getDesign(2)
      expect(design2.name).toBe("Button Fastening Aid")
      expect(design2.disabilityType).toBe("Limited dexterity, one-handed use")
    })
    
    it("should track the owner of each design", () => {
      registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      const design = getDesign(1)
      expect(design.owner).toBe(mockPrincipal)
      
      // Register with a different owner
      registerDesign(
          "Button Fastening Aid",
          "Device to assist with buttoning clothing",
          "Limited dexterity, one-handed use",
          "Independent dressing",
          "15cm x 2cm x 1cm",
          45,
          "Extended handle, button hook, zipper pull",
          "Handle length, grip texture, hook size",
          mockOtherPrincipal,
      )
      
      const design2 = getDesign(2)
      expect(design2.owner).toBe(mockOtherPrincipal)
    })
  })
  
  describe("Design Updates", () => {
    it("should update design information", () => {
      // First register a design
      registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      // Then update it
      const updateResult = updateDesign(
          1,
          "A customizable grip attachment for standard utensils with improved stability",
          "12cm x 6cm x 3.5cm",
          85,
          "Ergonomic grip, adjustable strap, non-slip surface, weighted base",
          "Size adjustments, different grip textures, various attachment methods, color options",
      )
      
      expect(updateResult.value).toBe(1)
      
      const design = getDesign(1)
      expect(design.description).toBe("A customizable grip attachment for standard utensils with improved stability")
      expect(design.dimensions).toBe("12cm x 6cm x 3.5cm")
      expect(design.weightGrams).toBe(85)
      expect(design.ergonomicFeatures).toContain("weighted base")
      expect(design.customizationOptions).toContain("color options")
    })
    
    it("should prevent updates by non-owners", () => {
      // Register a design
      registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      // Try to update with a different principal
      const updateResult = updateDesign(
          1,
          "Unauthorized update attempt",
          "12cm x 6cm x 3.5cm",
          85,
          "Ergonomic grip, adjustable strap, non-slip surface, weighted base",
          "Size adjustments, different grip textures, various attachment methods, color options",
          mockOtherPrincipal,
      )
      
      expect(updateResult.error).toBe(403)
      
      // Verify the design wasn't updated
      const design = getDesign(1)
      expect(design.description).toBe("A customizable grip attachment for standard utensils")
    })
    
    it("should return an error when updating a non-existent design", () => {
      const updateResult = updateDesign(
          999, // Non-existent ID
          "This design does not exist",
          "12cm x 6cm x 3.5cm",
          85,
          "Ergonomic grip, adjustable strap, non-slip surface, weighted base",
          "Size adjustments, different grip textures, various attachment methods, color options",
      )
      
      expect(updateResult.error).toBe(404)
    })
  })
  
  describe("Design Features", () => {
    it("should add features to a design", () => {
      // First register a design
      registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      // Then add features
      const feature1Result = addDesignFeature(
          1,
          "Universal Utensil Slot",
          "Accommodates various utensil shapes and sizes",
          "Critical",
          "Must fit utensils with handle diameters between 0.5cm and 2.5cm",
      )
      
      const feature2Result = addDesignFeature(
          1,
          "Quick-Release Mechanism",
          "Allows for easy utensil changes without removing the entire device",
          "Important",
          "Should be operable with one hand and minimal grip strength",
      )
      
      expect(feature1Result.value).toEqual({ designId: 1, featureId: 1 })
      expect(feature2Result.value).toEqual({ designId: 1, featureId: 2 })
      
      const feature1 = getDesignFeature(1, 1)
      expect(feature1).not.toBeNull()
      expect(feature1.name).toBe("Universal Utensil Slot")
      expect(feature1.importance).toBe("Critical")
      
      const feature2 = getDesignFeature(1, 2)
      expect(feature2.name).toBe("Quick-Release Mechanism")
      expect(feature2.technicalRequirements).toBe("Should be operable with one hand and minimal grip strength")
    })
    
    it("should prevent adding features to non-existent designs", () => {
      const featureResult = addDesignFeature(
          999, // Non-existent design ID
          "Universal Utensil Slot",
          "Accommodates various utensil shapes and sizes",
          "Critical",
          "Must fit utensils with handle diameters between 0.5cm and 2.5cm",
      )
      
      expect(featureResult.error).toBe(404)
    })
    
    it("should prevent non-owners from adding features", () => {
      // Register a design
      registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      // Try to add a feature with a different principal
      const featureResult = addDesignFeature(
          1,
          "Universal Utensil Slot",
          "Accommodates various utensil shapes and sizes",
          "Critical",
          "Must fit utensils with handle diameters between 0.5cm and 2.5cm",
          mockOtherPrincipal,
      )
      
      expect(featureResult.error).toBe(403)
    })
  })
  
  describe("Design Attachments", () => {
    it("should add attachments to a design", () => {
      // First register a design
      registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      // Then add attachments
      const attachment1Result = addDesignAttachment(
          1,
          "3D Model",
          "Complete 3D model for printing",
          "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          "STL",
      )
      
      const attachment2Result = addDesignAttachment(
          1,
          "Assembly Instructions",
          "Step-by-step guide for assembly and customization",
          "bafybeihwza4ywuxri2kdkwsuw5lfmvvf7jkl5ncwnqpuqmzh6rjjvdmriq",
          "PDF",
      )
      
      expect(attachment1Result.value).toBe(1)
      expect(attachment2Result.value).toBe(2)
      
      const attachment1 = getDesignAttachment(1)
      expect(attachment1).not.toBeNull()
      expect(attachment1.attachmentType).toBe("3D Model")
      expect(attachment1.fileFormat).toBe("STL")
      
      const attachment2 = getDesignAttachment(2)
      expect(attachment2.attachmentType).toBe("Assembly Instructions")
      expect(attachment2.fileFormat).toBe("PDF")
    })
    
    it("should prevent adding attachments to non-existent designs", () => {
      const attachmentResult = addDesignAttachment(
          999, // Non-existent design ID
          "3D Model",
          "Complete 3D model for printing",
          "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          "STL",
      )
      
      expect(attachmentResult.error).toBe(404)
    })
    
    it("should retrieve all attachments for a design", () => {
      // Register a design
      registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      // Add multiple attachments
      addDesignAttachment(
          1,
          "3D Model",
          "Complete 3D model for printing",
          "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          "STL",
      )
      
      addDesignAttachment(
          1,
          "Assembly Instructions",
          "Step-by-step guide for assembly and customization",
          "bafybeihwza4ywuxri2kdkwsuw5lfmvvf7jkl5ncwnqpuqmzh6rjjvdmriq",
          "PDF",
      )
      
      addDesignAttachment(
          1,
          "Usage Video",
          "Demonstration of how to use the device",
          "bafybeihdwdcefgh4dqkuanr3sf7oijs5ckvaiz3zucrmphqeuk55fbzabcde",
          "MP4",
      )
      
      // Get all attachments for the design
      const attachments = getDesignAttachments(1)
      expect(attachments.value.length).toBe(3)
      
      // Verify the attachments are for the correct design
      for (const item of attachments.value) {
        expect(item.attachment.designId).toBe(1)
      }
      
      // Verify we have the expected attachment types
      const types = attachments.value.map((item) => item.attachment.attachmentType)
      expect(types).toContain("3D Model")
      expect(types).toContain("Assembly Instructions")
      expect(types).toContain("Usage Video")
    })
  })
  
  describe("Design Versions", () => {
    it("should create design versions", () => {
      // First register a design
      registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      // Then create versions
      const version1Result = createDesignVersion(1, 1, "Initial release")
      
      const version2Result = createDesignVersion(
          1,
          2,
          "Improved grip texture for better stability, reduced weight by 10g",
      )
      
      expect(version1Result.value).toEqual({ designId: 1, version: 1 })
      expect(version2Result.value).toEqual({ designId: 1, version: 2 })
      
      const version1 = getDesignVersion(1, 1)
      expect(version1).not.toBeNull()
      expect(version1.changes).toBe("Initial release")
      
      const version2 = getDesignVersion(1, 2)
      expect(version2.changes).toBe("Improved grip texture for better stability, reduced weight by 10g")
    })
    
    it("should prevent non-owners from creating versions", () => {
      // Register a design
      registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      // Try to create a version with a different principal
      const versionResult = createDesignVersion(1, 1, "Unauthorized version attempt", mockOtherPrincipal)
      
      expect(versionResult.error).toBe(403)
    })
    
    it("should prevent creating versions for non-existent designs", () => {
      const versionResult = createDesignVersion(
          999, // Non-existent design ID
          1,
          "This design does not exist",
      )
      
      expect(versionResult.error).toBe(404)
    })
  })
  
  describe("Design Search", () => {
    it("should search designs by disability type", () => {
      // Register multiple designs with different disability types
      registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      registerDesign(
          "Button Fastening Aid",
          "Device to assist with buttoning clothing",
          "Limited dexterity, one-handed use",
          "Independent dressing",
          "15cm x 2cm x 1cm",
          45,
          "Extended handle, button hook, zipper pull",
          "Handle length, grip texture, hook size",
      )
      
      registerDesign(
          "Adaptive Keyboard",
          "Keyboard with larger keys and spacing",
          "Limited hand mobility, tremors",
          "Computer access",
          "45cm x 15cm x 2cm",
          850,
          "Large keys, key guards, adjustable sensitivity",
          "Key size, spacing, color coding",
      )
      
      // Search for designs related to hand mobility
      const searchResult1 = searchDesignsByDisability("hand mobility")
      expect(searchResult1.value.length).toBe(2)
      
      // Verify the correct designs were found
      const names1 = searchResult1.value.map((item) => item.design.name)
      expect(names1).toContain("Adaptive Utensil Holder")
      expect(names1).toContain("Adaptive Keyboard")
      
      // Search for designs related to one-handed use
      const searchResult2 = searchDesignsByDisability("one-handed")
      expect(searchResult2.value.length).toBe(1)
      expect(searchResult2.value[0].design.name).toBe("Button Fastening Aid")
    })
    
    it("should return empty results for disability types with no matches", () => {
      // Register a design
      registerDesign(
          "Adaptive Utensil Holder",
          "A customizable grip attachment for standard utensils",
          "Limited hand mobility, arthritis",
          "Eating independently with standard utensils",
          "10cm x 5cm x 3cm",
          75,
          "Ergonomic grip, adjustable strap, non-slip surface",
          "Size adjustments, different grip textures, various attachment methods",
      )
      
      // Search for a disability type that doesn't match
      const searchResult = searchDesignsByDisability("visual impairment")
      expect(searchResult.value.length).toBe(0)
    })
  })
})

