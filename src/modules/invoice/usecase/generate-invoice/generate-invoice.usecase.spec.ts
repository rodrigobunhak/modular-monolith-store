import GenerateInvoiceUseCase from "./generate-invoice.usecase"

const MockRepository = () => {
  return {
    add: jest.fn(),
    find: jest.fn(),
  }
}

describe("Generate Invoice use case unit test", () => {

  it("should generate a invoice", async () => {
    const repository = MockRepository()
    const usecase = new GenerateInvoiceUseCase(repository)
    const input = {
      name: "Lucian",
      document: "123",
      street: "Rua 123",
      number: "99",
      complement: "Casa Verde",
      city: "criciúma",
      state: "SC",
      zipCode: "88888-888",
      items: [
        { id: "1", name: "Product 1", price: 10 },
        { id: "2", name: "Product 2", price: 20 }
      ]
    }
    const result = await usecase.execute(input)
    expect(repository.add).toHaveBeenCalled()
    expect(typeof result.id).toBe('string');
    expect(result.name).toEqual(input.name)
    expect(result.items[0].id).toEqual(input.items[0].id)
    expect(result.items[0].name).toEqual(input.items[0].name)
    expect(result.items[0].price).toEqual(input.items[0].price)
    expect(result.items[1].id).toEqual(input.items[1].id)
    expect(result.items[1].name).toEqual(input.items[1].name)
    expect(result.items[1].price).toEqual(input.items[1].price)
    expect(result.city).toEqual(input.city)
    expect(result.complement).toEqual(input.complement)
    expect(result.number).toEqual(input.number)
    expect(result.state).toEqual(input.state)
    expect(result.street).toEqual(input.street)
    expect(result.zipCode).toEqual(input.zipCode)
    expect(result.total).toEqual(30)
  })
})