import { Sequelize } from "sequelize-typescript";
import { ItemModel } from "../repository/item.model";
import InvoiceModel from "../repository/invoice.model";
import InvoiceFacadeFactory from "../factory/facade.factory";

describe("InvoiceFacade test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([InvoiceModel, ItemModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a invoice", async () => {
    const facade = InvoiceFacadeFactory.create();
    const input = {
      name: "João",
      document: "123",
      street: "Rua 1",
      city: "Porto União",
      complement: "Casa Laranja",
      number: "25",
      state: "SC",
      zipCode: "88888-888",
      items: [{
        id: "1",
        name: "Product 1",
        price: 10
      }],
    };
    const output = await facade.generate(input);
    expect(output.id).toBeDefined();
    expect(output.name).toBe(input.name);
    expect(output.document).toBe(input.document);
    expect(output.street).toBe(input.street);
    expect(output.city).toBe(input.city);
    expect(output.complement).toBe(input.complement);
    expect(output.number).toBe(input.number);
    expect(output.state).toBe(input.state);
    expect(output.zipCode).toBe(input.zipCode);
    expect(output.items[0].id).toBe(input.items[0].id);
    expect(output.items[0].name).toBe(input.items[0].name);
    expect(output.items[0].price).toBe(input.items[0].price);
  });

  it("should find a invoice", async () => {
    const facade = InvoiceFacadeFactory.create();
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
        }
      ],
    },
    {
      include: ItemModel
    }
    );
    const result = await facade.find({ id: "1" });
    expect(result.id).toEqual("1");
    expect(result.name).toEqual("João");
    expect(result.document).toEqual("123");
    expect(result.address.street).toEqual("Rua dos Bobos");
    expect(result.address.number).toEqual("0");
    expect(result.address.complement).toEqual("Casa engraçada");
    expect(result.address.city).toEqual("Prudentópolis");
    expect(result.address.state).toEqual("SC");
    expect(result.address.zipCode).toEqual("88888-888");
    expect(result.items[0].id).toEqual("1");
    expect(result.items[0].name).toEqual("Product 1");
    expect(result.items[0].price).toEqual(10);
  });
});