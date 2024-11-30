import Address from "../../../@shared/domain/value-object/address"
import Id from "../../../@shared/domain/value-object/id.value-object"
import Invoice from "../../domain/invoice.entity"
import InvoiceItem from "../../domain/item.entity"
import FindInvoiceUseCase from "./find-invoice.usecase"

const item1 = new InvoiceItem({
  id: new Id("1"),
  name: "Product 1",
  price: 10,
})

const item2 = new InvoiceItem({
  id: new Id("2"),
  name: "Product 2",
  price: 20,
})

const invoice = new Invoice({
  id: new Id("1"),
  name: "Lucian",
  document: "123",
  items: [item1, item2],
  address: new Address(
    "Rua 123",
    "99",
    "Casa Verde",
    "Criciúma",
    "SC",
    "88888-888",
  )
})

const MockRepository = () => {
  return {
    add: jest.fn(),
    find: jest.fn().mockReturnValue(Promise.resolve(invoice))
  }
}

describe("Find Invoice use case unit test", () => {

  it("should find a invoice", async () => {
    const repository = MockRepository()
    const usecase = new FindInvoiceUseCase(repository)
    const input = {
      id: "1"
    }
    const result = await usecase.execute(input)
    expect(repository.find).toHaveBeenCalled()
    expect(result.id).toEqual(input.id)
    expect(result.name).toEqual(invoice.name)
    expect(result.items[0].id).toEqual(item1.id.id)
    expect(result.items[0].name).toEqual(item1.name)
    expect(result.items[0].price).toEqual(item1.price)
    expect(result.items[1].id).toEqual(item2.id.id)
    expect(result.items[1].name).toEqual(item2.name)
    expect(result.items[1].price).toEqual(item2.price)
    expect(result.address.city).toEqual(invoice.address.city)
    expect(result.address.complement).toEqual(invoice.address.complement)
    expect(result.address.number).toEqual(invoice.address.number)
    expect(result.address.state).toEqual(invoice.address.state)
    expect(result.address.street).toEqual(invoice.address.street)
    expect(result.address.zipCode).toEqual(invoice.address.zipCode)
    expect(result.createdAt).toEqual(invoice.createdAt)
  })
})