import { Sequelize } from "sequelize-typescript";
import InvoiceModel from "./invoice.model";
import Invoice from "../domain/invoice.entity";
import Id from "../../@shared/domain/value-object/id.value-object";
import Address from "../../@shared/domain/value-object/address";
import InvoiceItem from "../domain/item.entity";
import InvoiceRepository from "./invoice.repository";
import { ItemModel } from "./item.model";

describe("Invoice Repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });
    sequelize.addModels([InvoiceModel, ItemModel])
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  })

  it("should create a invoice", async () => {
    const invoice = new Invoice({
      name: "Jonas",
      address: new Address("Rua 5", "99", "Casa Verde", "União da Viória", "PR", "88888-888"),
      document: "123",
      items: [
        new InvoiceItem({ id: new Id("1"), name: "Product 1", price: 10 }),
        new InvoiceItem({ id: new Id("2"), name: "Product 2", price: 20 })
      ]
    })
    const invoiceRepository = new InvoiceRepository();
    await invoiceRepository.add(invoice);
    const invoiceDb = await InvoiceModel.findOne({
      where: { id: invoice.id.id },
      include: ItemModel
    });
    expect(invoice.id.id).toEqual(invoiceDb.id);
    expect(invoice.name).toEqual(invoiceDb.name);
    expect(invoice.address.street).toEqual(invoiceDb.street);
    expect(invoice.address.number).toEqual(invoiceDb.number);
    expect(invoice.address.complement).toEqual(invoiceDb.complement);
    expect(invoice.address.city).toEqual(invoiceDb.city);
    expect(invoice.address.state).toEqual(invoiceDb.state);
    expect(invoice.address.zipCode).toEqual(invoiceDb.zipcode);
    expect(invoice.items[0].id.id).toEqual(invoiceDb.items[0].id);
    expect(invoice.items[0].name).toEqual(invoiceDb.items[0].name);
    expect(invoice.items[0].price).toEqual(invoiceDb.items[0].price);
    expect(invoice.items[1].id.id).toEqual(invoiceDb.items[1].id);
    expect(invoice.items[1].name).toEqual(invoiceDb.items[1].name);
    expect(invoice.items[1].price).toEqual(invoiceDb.items[1].price);
  })

  it("should find a invoice", async () => {
    const invoiceRepository = new InvoiceRepository();
    await InvoiceModel.create({
      id: "1",
      name: "João",
      document: "123",
      street: "Rua dos Bobos",
      number: "0",
      complement: "Casa engraçada",
      city: "Prudentópolis",
      state: "SC",
      zipcode: "88888-888",
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: "1",
          name: "Product 1",
          price: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          name: "Product 2",
          price: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] 
    },
    {
      include: ItemModel
    }
    );
    const invoice = await invoiceRepository.find("1");
    expect(invoice.id.id).toEqual("1");
    expect(invoice.name).toEqual("João");
    expect(invoice.document).toEqual("123");
    expect(invoice.address.street).toEqual("Rua dos Bobos");
    expect(invoice.address.number).toEqual("0");
    expect(invoice.address.complement).toEqual("Casa engraçada");
    expect(invoice.address.city).toEqual("Prudentópolis");
    expect(invoice.address.state).toEqual("SC");
    expect(invoice.address.zipCode).toEqual("88888-888");
    expect(invoice.items[0].id.id).toEqual("1");
    expect(invoice.items[0].name).toEqual("Product 1");
    expect(invoice.items[0].price).toEqual(10);
    expect(invoice.items[1].id.id).toEqual("2");
    expect(invoice.items[1].name).toEqual("Product 2");
    expect(invoice.items[1].price).toEqual(20);
  })
})