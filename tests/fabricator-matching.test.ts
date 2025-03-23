import { describe, it, expect, beforeEach } from "vitest"

// Mock implementation for testing Clarity contracts
const mockPrincipal = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const mockRequesterPrincipal = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
const mockOtherPrincipal = "ST3KCXTX2BZKP4XZ51W7XBBZWPYJ9X992J8YZXCVB"
const mockBlockHeight = 100

// Mock state
let lastFabricatorId = 0
let lastRequestId = 0
let lastProposalId = 0
let lastContractId = 0
const fabricators = new Map()
const fabricationRequests = new Map()
const fabricationProposals = new Map()
const fabricationContracts = new Map()

// Mock contract functions
const registerFabricator = (
    name,
    expertise,
    equipment,
    materialsHandled,
    location,
    capacityPerMonth,
    certification,
    owner = mockPrincipal,
) => {
  const newId = lastFabricatorId + 1
  lastFabricatorId = newId
  
  fabricators.set(newId, {
    owner,
    name,
    expertise,
    equipment,
    materialsHandled,
    location,
    capacityPerMonth,
    certification,
    registrationDate: mockBlockHeight,
  })
  
  return { value: newId }
}

const getFabricator = (id) => {
  const fabricator = fabricators.get(id)
  return fabricator ? fabricator : null
}

const updateFabricator = (
    id,
    expertise,
    equipment,
    materialsHandled,
    location,
    capacityPerMonth,
    certification,
    owner = mockPrincipal,
) => {
  const fabricator = fabricators.get(id)
  if (!fabricator) return { error: 404 }
  if (fabricator.owner !== owner) return { error: 403 }
  
  fabricators.set(id, {
    ...fabricator,
    expertise,
    equipment,
    materialsHandled,
    location,
    capacityPerMonth,
    certification,
  })
  
  return { value: id }
}

const createRequest = (
    designId,
    quantity,
    deadline,
    budget,
    specialRequirements,
    requester = mockRequesterPrincipal,
) => {
  const newId = lastRequestId + 1
  lastRequestId = newId
  
  fabricationRequests.set(newId, {
    requester,
    designId,
    quantity,
    deadline,
    budget,
    specialRequirements,
    status: "open",
    requestDate: mockBlockHeight,
  })
  
  return { value: newId }
}

const getRequest = (id) => {
  const request = fabricationRequests.get(id)
  return request ? request : null
}

const updateRequestStatus = (id, status, requester = mockRequesterPrincipal) => {
  const request = fabricationRequests.get(id)
  if (!request) return { error: 404 }
  if (request.requester !== requester) return { error: 403 }
  
  fabricationRequests.set(id, {
    ...request,
    status,
  })
  
  return { value: id }
}

const submitProposal = (
    requestId,
    fabricatorId,
    estimatedCost,
    estimatedCompletion,
    approach,
    materialsProposed,
    owner = mockPrincipal,
) => {
  const request = fabricationRequests.get(requestId)
  if (!request) return { error: 404 }
  
  const fabricator = fabricators.get(fabricatorId)
  if (!fabricator) return { error: 404 }
  if (fabricator.owner !== owner) return { error: 403 }
  
  const newId = lastProposalId + 1
  lastProposalId = newId
  
  fabricationProposals.set(newId, {
    requestId,
    fabricatorId,
    estimatedCost,
    estimatedCompletion,
    approach,
    materialsProposed,
    status: "submitted",
    proposalDate: mockBlockHeight,
  })
  
  return { value: newId }
}

const getProposal = (id) => {
  const proposal = fabricationProposals.get(id)
  return proposal ? proposal : null
}

const updateProposalStatus = (id, status, owner = mockPrincipal) => {
  const proposal = fabricationProposals.get(id)
  if (!proposal) return { error: 404 }
  
  const fabricator = fabricators.get(proposal.fabricatorId)
  if (!fabricator) return { error: 404 }
  if (fabricator.owner !== owner) return { error: 403 }
  
  fabricationProposals.set(id, {
    ...proposal,
    status,
  })
  
  return { value: id }
}

const createContract = (
    requestId,
    proposalId,
    agreedCost,
    agreedDeadline,
    paymentTerms,
    requester = mockRequesterPrincipal,
) => {
  const request = fabricationRequests.get(requestId)
  if (!request) return { error: 404 }
  if (request.requester !== requester) return { error: 403 }
  
  const proposal = fabricationProposals.get(proposalId)
  if (!proposal) return { error: 404 }
  if (proposal.requestId !== requestId) return { error: 400 }
  
  const fabricator = fabricators.get(proposal.fabricatorId)
  if (!fabricator) return { error: 404 }
  
  const newId = lastContractId + 1
  lastContractId = newId
  
  fabricationContracts.set(newId, {
    requestId,
    proposalId,
    requester,
    fabricator: fabricator.owner,
    agreedCost,
    agreedDeadline,
    paymentTerms,
    status: "active",
    creationDate: mockBlockHeight,
  })
  
  return { value: newId }
}

const getContract = (id) => {
  const contract = fabricationContracts.get(id)
  return contract ? contract : null
}

const updateContractStatus = (id, status, principal = mockPrincipal) => {
  const contract = fabricationContracts.get(id)
  if (!contract) return { error: 404 }
  if (contract.requester !== principal && contract.fabricator !== principal) return { error: 403 }
  
  fabricationContracts.set(id, {
    ...contract,
    status,
  })
  
  return { value: id }
}

// Mock function to find fabricators by expertise
const findFabricatorsByExpertise = (expertise) => {
  const results = []
  for (const [id, fabricator] of fabricators.entries()) {
    if (fabricator.expertise.includes(expertise)) {
      results.push({ id, fabricator })
    }
  }
  return { value: results }
}

// Mock function to get open requests
const getOpenRequests = () => {
  const results = []
  for (const [id, request] of fabricationRequests.entries()) {
    if (request.status === "open") {
      results.push({ id, request })
    }
  }
  return { value: results }
}

// Mock function to get proposals for a request
const getProposalsForRequest = (requestId) => {
  const results = []
  for (const [id, proposal] of fabricationProposals.entries()) {
    if (proposal.requestId === requestId) {
      results.push({ id, proposal })
    }
  }
  return { value: results }
}

describe("Fabricator Matching Contract", () => {
  beforeEach(() => {
    // Reset state before each test
    lastFabricatorId = 0
    lastRequestId = 0
    lastProposalId = 0
    lastContractId = 0
    fabricators.clear()
    fabricationRequests.clear()
    fabricationProposals.clear()
    fabricationContracts.clear()
  })
  
  describe("Fabricator Registration", () => {
    it("should register a new fabricator", () => {
      const result = registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      expect(result.value).toBe(1)
      expect(fabricators.size).toBe(1)
      
      const fabricator = getFabricator(1)
      expect(fabricator).not.toBeNull()
      expect(fabricator.name).toBe("Adaptive Solutions Workshop")
      expect(fabricator.expertise).toBe("3D printing, CNC machining, custom molding")
      expect(fabricator.equipment).toBe("3D printers, CNC mill, injection molding, laser cutter")
      expect(fabricator.capacityPerMonth).toBe(50)
    })
    
    it("should register multiple fabricators with unique IDs", () => {
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      const result2 = registerFabricator(
          "Precision Adaptive Tools",
          "Fine metalworking, electronics integration, ergonomic design",
          "Metal lathes, welding equipment, electronics lab, 3D scanners",
          "Metals, electronics, fabrics, plastics",
          "Boston, MA",
          30,
          "FDA Registered Facility, ISO 13485 certified",
      )
      
      expect(result2.value).toBe(2)
      expect(fabricators.size).toBe(2)
      
      const fabricator2 = getFabricator(2)
      expect(fabricator2.name).toBe("Precision Adaptive Tools")
      expect(fabricator2.location).toBe("Boston, MA")
    })
    
    it("should track the owner of each fabricator profile", () => {
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      const fabricator = getFabricator(1)
      expect(fabricator.owner).toBe(mockPrincipal)
      
      // Register with a different owner
      registerFabricator(
          "Precision Adaptive Tools",
          "Fine metalworking, electronics integration, ergonomic design",
          "Metal lathes, welding equipment, electronics lab, 3D scanners",
          "Metals, electronics, fabrics, plastics",
          "Boston, MA",
          30,
          "FDA Registered Facility, ISO 13485 certified",
          mockOtherPrincipal,
      )
      
      const fabricator2 = getFabricator(2)
      expect(fabricator2.owner).toBe(mockOtherPrincipal)
    })
  })
  
  describe("Fabricator Updates", () => {
    it("should update fabricator information", () => {
      // First register a fabricator
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      // Then update it
      const updateResult = updateFabricator(
          1,
          "3D printing, CNC machining, custom molding, electronics integration",
          "3D printers, CNC mill, injection molding, laser cutter, electronics lab",
          "Plastics, metals, silicone, composites, conductive materials",
          "Portland, OR",
          75,
          "Certified Assistive Technology Provider, FDA Registered Facility",
      )
      
      expect(updateResult.value).toBe(1)
      
      const fabricator = getFabricator(1)
      expect(fabricator.expertise).toContain("electronics integration")
      expect(fabricator.equipment).toContain("electronics lab")
      expect(fabricator.materialsHandled).toContain("conductive materials")
      expect(fabricator.capacityPerMonth).toBe(75)
      expect(fabricator.certification).toContain("FDA Registered Facility")
    })
    
    it("should prevent updates by non-owners", () => {
      // Register a fabricator
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      // Try to update with a different principal
      const updateResult = updateFabricator(
          1,
          "Unauthorized update attempt",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
          mockOtherPrincipal,
      )
      
      expect(updateResult.error).toBe(403)
      
      // Verify the fabricator wasn't updated
      const fabricator = getFabricator(1)
      expect(fabricator.expertise).toBe("3D printing, CNC machining, custom molding")
    })
    
    it("should return an error when updating a non-existent fabricator", () => {
      const updateResult = updateFabricator(
          999, // Non-existent ID
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      expect(updateResult.error).toBe(404)
    })
  })
  
  describe("Fabrication Requests", () => {
    it("should create a fabrication request", () => {
      const result = createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      expect(result.value).toBe(1)
      expect(fabricationRequests.size).toBe(1)
      
      const request = getRequest(1)
      expect(request).not.toBeNull()
      expect(request.designId).toBe(1)
      expect(request.quantity).toBe(10)
      expect(request.budget).toBe(5000)
      expect(request.status).toBe("open")
      expect(request.specialRequirements).toContain("waterproof finish")
    })
    
    it("should create multiple requests with unique IDs", () => {
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      const result2 = createRequest(
          2, // design ID
          5, // quantity
          mockBlockHeight + 2000, // deadline
          3000, // budget (in cents)
          "Must be lightweight, under 100g per unit",
      )
      
      expect(result2.value).toBe(2)
      expect(fabricationRequests.size).toBe(2)
      
      const request2 = getRequest(2)
      expect(request2.designId).toBe(2)
      expect(request2.quantity).toBe(5)
      expect(request2.specialRequirements).toContain("lightweight")
    })
    
    it("should update request status", () => {
      // First create a request
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      // Then update its status
      const updateResult = updateRequestStatus(1, "under review")
      
      expect(updateResult.value).toBe(1)
      
      const request = getRequest(1)
      expect(request.status).toBe("under review")
    })
    
    it("should prevent non-requesters from updating request status", () => {
      // Create a request
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      // Try to update with a different principal
      const updateResult = updateRequestStatus(1, "under review", mockOtherPrincipal)
      
      expect(updateResult.error).toBe(403)
      
      // Verify the request wasn't updated
      const request = getRequest(1)
      expect(request.status).toBe("open")
    })
    
    it("should get all open requests", () => {
      // Create multiple requests with different statuses
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      createRequest(
          2, // design ID
          5, // quantity
          mockBlockHeight + 2000, // deadline
          3000, // budget (in cents)
          "Must be lightweight, under 100g per unit",
      )
      
      // Update one request to a non-open status
      updateRequestStatus(1, "under review")
      
      // Get open requests
      const openRequests = getOpenRequests()
      expect(openRequests.value.length).toBe(1)
      expect(openRequests.value[0].id).toBe(2)
      expect(openRequests.value[0].request.status).toBe("open")
    })
  })
  
  describe("Fabrication Proposals", () => {
    it("should submit a fabrication proposal", () => {
      // First register a fabricator
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      // Create a request
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      // Submit a proposal
      const result = submitProposal(
          1, // request ID
          1, // fabricator ID
          4500, // estimated cost (in cents)
          mockBlockHeight + 800, // estimated completion
          "Will use high-durability PLA with waterproof coating, custom-fitted for ergonomics",
          "PLA plastic, silicone grip, waterproof coating",
      )
      
      expect(result.value).toBe(1)
      expect(fabricationProposals.size).toBe(1)
      
      const proposal = getProposal(1)
      expect(proposal).not.toBeNull()
      expect(proposal.requestId).toBe(1)
      expect(proposal.fabricatorId).toBe(1)
      expect(proposal.estimatedCost).toBe(4500)
      expect(proposal.status).toBe("submitted")
      expect(proposal.approach).toContain("high-durability PLA")
    })
    
    it("should prevent submitting proposals for non-existent requests", () => {
      // Register a fabricator
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      // Try to submit a proposal for a non-existent request
      const result = submitProposal(
          999, // non-existent request ID
          1, // fabricator ID
          4500, // estimated cost (in cents)
          mockBlockHeight + 800, // estimated completion
          "Will use high-durability PLA with waterproof coating, custom-fitted for ergonomics",
          "PLA plastic, silicone grip, waterproof coating",
      )
      
      expect(result.error).toBe(404)
    })
    
    it("should prevent non-owners from submitting proposals for a fabricator", () => {
      // Register a fabricator
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      // Create a request
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      // Try to submit a proposal with a different principal
      const result = submitProposal(
          1, // request ID
          1, // fabricator ID
          4500, // estimated cost (in cents)
          mockBlockHeight + 800, // estimated completion
          "Will use high-durability PLA with waterproof coating, custom-fitted for ergonomics",
          "PLA plastic, silicone grip, waterproof coating",
          mockOtherPrincipal,
      )
      
      expect(result.error).toBe(403)
    })
    
    it("should update proposal status", () => {
      // Setup fabricator and request
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      // Submit a proposal
      submitProposal(
          1, // request ID
          1, // fabricator ID
          4500, // estimated cost (in cents)
          mockBlockHeight + 800, // estimated completion
          "Will use high-durability PLA with waterproof coating, custom-fitted for ergonomics",
          "PLA plastic, silicone grip, waterproof coating",
      )
      
      // Update proposal status
      const updateResult = updateProposalStatus(1, "accepted")
      
      expect(updateResult.value).toBe(1)
      
      const proposal = getProposal(1)
      expect(proposal.status).toBe("accepted")
    })
    
    it("should get all proposals for a request", () => {
      // Setup fabricators and request
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      registerFabricator(
          "Precision Adaptive Tools",
          "Fine metalworking, electronics integration, ergonomic design",
          "Metal lathes, welding equipment, electronics lab, 3D scanners",
          "Metals, electronics, fabrics, plastics",
          "Boston, MA",
          30,
          "FDA Registered Facility, ISO 13485 certified",
          mockOtherPrincipal,
      )
      
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      // Submit multiple proposals
      submitProposal(
          1, // request ID
          1, // fabricator ID
          4500, // estimated cost (in cents)
          mockBlockHeight + 800, // estimated completion
          "Will use high-durability PLA with waterproof coating, custom-fitted for ergonomics",
          "PLA plastic, silicone grip, waterproof coating",
      )
      
      submitProposal(
          1, // request ID
          2, // fabricator ID
          5000, // estimated cost (in cents)
          mockBlockHeight + 700, // estimated completion
          "Will use medical-grade silicone with embedded metal frame for durability",
          "Medical silicone, aluminum frame, hypoallergenic coating",
          mockOtherPrincipal,
      )
      
      // Get proposals for the request
      const proposals = getProposalsForRequest(1)
      expect(proposals.value.length).toBe(2)
      
      // Verify we have proposals from both fabricators
      const fabricatorIds = proposals.value.map((item) => item.proposal.fabricatorId)
      expect(fabricatorIds).toContain(1)
      expect(fabricatorIds).toContain(2)
    })
  })
  
  describe("Fabrication Contracts", () => {
    it("should create a fabrication contract", () => {
      // Setup fabricator, request, and proposal
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      submitProposal(
          1, // request ID
          1, // fabricator ID
          4500, // estimated cost (in cents)
          mockBlockHeight + 800, // estimated completion
          "Will use high-durability PLA with waterproof coating, custom-fitted for ergonomics",
          "PLA plastic, silicone grip, waterproof coating",
      )
      
      // Create a contract
      const result = createContract(
          1, // request ID
          1, // proposal ID
          4500, // agreed cost (in cents)
          mockBlockHeight + 900, // agreed deadline
          "50% upfront, 50% on delivery",
      )
      
      expect(result.value).toBe(1)
      expect(fabricationContracts.size).toBe(1)
      
      const contract = getContract(1)
      expect(contract).not.toBeNull()
      expect(contract.requestId).toBe(1)
      expect(contract.proposalId).toBe(1)
      expect(contract.agreedCost).toBe(4500)
      expect(contract.status).toBe("active")
      expect(contract.paymentTerms).toBe("50% upfront, 50% on delivery")
    })
    
    it("should prevent creating contracts for non-existent requests or proposals", () => {
      // Try with non-existent request
      const result1 = createContract(
          999, // non-existent request ID
          1, // proposal ID
          4500, // agreed cost (in cents)
          mockBlockHeight + 900, // agreed deadline
          "50% upfront, 50% on delivery",
      )
      
      expect(result1.error).toBe(404)
      
      // Setup request but try with non-existent proposal
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      const result2 = createContract(
          1, // request ID
          999, // non-existent proposal ID
          4500, // agreed cost (in cents)
          mockBlockHeight + 900, // agreed deadline
          "50% upfront, 50% on delivery",
      )
      
      expect(result2.error).toBe(404)
    })
    
    it("should prevent non-requesters from creating contracts", () => {
      // Setup fabricator, request, and proposal
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      submitProposal(
          1, // request ID
          1, // fabricator ID
          4500, // estimated cost (in cents)
          mockBlockHeight + 800, // estimated completion
          "Will use high-durability PLA with waterproof coating, custom-fitted for ergonomics",
          "PLA plastic, silicone grip, waterproof coating",
      )
      
      // Try to create a contract with a different principal
      const result = createContract(
          1, // request ID
          1, // proposal ID
          4500, // agreed cost (in cents)
          mockBlockHeight + 900, // agreed deadline
          "50% upfront, 50% on delivery",
          mockOtherPrincipal,
      )
      
      expect(result.error).toBe(403)
    })
    
    it("should update contract status by either party", () => {
      // Setup fabricator, request, proposal, and contract
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      submitProposal(
          1, // request ID
          1, // fabricator ID
          4500, // estimated cost (in cents)
          mockBlockHeight + 800, // estimated completion
          "Will use high-durability PLA with waterproof coating, custom-fitted for ergonomics",
          "PLA plastic, silicone grip, waterproof coating",
      )
      
      createContract(
          1, // request ID
          1, // proposal ID
          4500, // agreed cost (in cents)
          mockBlockHeight + 900, // agreed deadline
          "50% upfront, 50% on delivery",
      )
      
      // Update contract status as fabricator
      const updateResult1 = updateContractStatus(1, "in production")
      
      expect(updateResult1.value).toBe(1)
      
      const contract1 = getContract(1)
      expect(contract1.status).toBe("in production")
      
      // Update contract status as requester
      const updateResult2 = updateContractStatus(1, "payment sent", mockRequesterPrincipal)
      
      expect(updateResult2.value).toBe(1)
      
      const contract2 = getContract(1)
      expect(contract2.status).toBe("payment sent")
    })
    
    it("should prevent unauthorized parties from updating contract status", () => {
      // Setup fabricator, request, proposal, and contract
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      createRequest(
          1, // design ID
          10, // quantity
          mockBlockHeight + 1000, // deadline
          5000, // budget (in cents)
          "Need waterproof finish, prefer bright colors for visibility",
      )
      
      submitProposal(
          1, // request ID
          1, // fabricator ID
          4500, // estimated cost (in cents)
          mockBlockHeight + 800, // estimated completion
          "Will use high-durability PLA with waterproof coating, custom-fitted for ergonomics",
          "PLA plastic, silicone grip, waterproof coating",
      )
      
      createContract(
          1, // request ID
          1, // proposal ID
          4500, // agreed cost (in cents)
          mockBlockHeight + 900, // agreed deadline
          "50% upfront, 50% on delivery",
      )
      
      // Try to update contract status with an unauthorized principal
      const updateResult = updateContractStatus(1, "in production", mockOtherPrincipal)
      
      expect(updateResult.error).toBe(403)
      
      // Verify the contract wasn't updated
      const contract = getContract(1)
      expect(contract.status).toBe("active")
    })
  })
  
  describe("Fabricator Search", () => {
    it("should find fabricators by expertise", () => {
      // Register multiple fabricators with different expertise
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      registerFabricator(
          "Precision Adaptive Tools",
          "Fine metalworking, electronics integration, ergonomic design",
          "Metal lathes, welding equipment, electronics lab, 3D scanners",
          "Metals, electronics, fabrics, plastics",
          "Boston, MA",
          30,
          "FDA Registered Facility, ISO 13485 certified",
          mockOtherPrincipal,
      )
      
      registerFabricator(
          "Adaptive Textiles",
          "Textile fabrication, soft goods, wearable adaptations",
          "Industrial sewing machines, fabric cutters, embroidery equipment",
          "Fabrics, elastics, velcro, neoprene",
          "Chicago, IL",
          100,
          "Certified in Medical Textiles",
          mockRequesterPrincipal,
      )
      
      // Search for fabricators with 3D printing expertise
      const searchResult1 = findFabricatorsByExpertise("3D printing")
      expect(searchResult1.value.length).toBe(1)
      expect(searchResult1.value[0].fabricator.name).toBe("Adaptive Solutions Workshop")
      
      // Search for fabricators with electronics expertise
      const searchResult2 = findFabricatorsByExpertise("electronics")
      expect(searchResult2.value.length).toBe(1)
      expect(searchResult2.value[0].fabricator.name).toBe("Precision Adaptive Tools")
      
      // Search for fabricators with design expertise (should match multiple)
      const searchResult3 = findFabricatorsByExpertise("design")
      expect(searchResult3.value.length).toBe(1)
      expect(searchResult3.value[0].fabricator.name).toBe("Precision Adaptive Tools")
    })
    
    it("should return empty results for expertise with no matches", () => {
      // Register a fabricator
      registerFabricator(
          "Adaptive Solutions Workshop",
          "3D printing, CNC machining, custom molding",
          "3D printers, CNC mill, injection molding, laser cutter",
          "Plastics, metals, silicone, composites",
          "Portland, OR",
          50,
          "Certified Assistive Technology Provider",
      )
      
      // Search for expertise that doesn't match
      const searchResult = findFabricatorsByExpertise("woodworking")
      expect(searchResult.value.length).toBe(0)
    })
  })
})

