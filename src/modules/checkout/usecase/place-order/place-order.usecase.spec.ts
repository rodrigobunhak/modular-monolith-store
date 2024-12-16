import Address from "../../../@shared/domain/value-object/address";
import Id from "../../../@shared/domain/value-object/id.value-object";
import Client from "../../../client-adm/domain/client.entity";
import ClientAdmFacadeInterface, { AddClientFacadeInputDto, FindClientFacadeInputDto, FindClientFacadeOutputDto } from "../../../client-adm/facade/client-adm.facade.interface";
import { FindInvoiceFacadeInputDto, FindInvoiceFacadeOutputDto, GenerateInvoiceFacadeInputDto, GenerateInvoiceFacadeOutputDto, InvoiceFacadeInterface } from "../../../invoice/facade/invoice.facade.interface";
import ProductAdmFacadeInterface, { AddProductFacadeInputDto, CheckStockFacadeInputDto, CheckStockFacadeOutputDto } from "../../../product-adm/facade/product-adm.facade.interface";
// import Client from "../../domain/client.entity";
import Order from "../../domain/order.entity";
import Product from "../../domain/product.entity";
import CheckoutGateway from "../../gateway/checkout.gateway";
import { PlaceOrderInputDto } from "./place-order.dto";
import PlaceOrderUseCase from "./place-order.usecase";

describe("PlaceOrderUseCase unit test", () => {
  
  const mockDate = new Date(2000, 1, 1);

  describe("validateProducts method", () => {
    //@ts-expect-error - no params in constructor
    const placeOrderUsecase = new PlaceOrderUseCase();
    
    it("should throw error if no products are selected", async () => {
      const input: PlaceOrderInputDto = {
        clientId: "0",
        products: [],
      };
      await expect(placeOrderUsecase["validateProducts"](input)).rejects.toThrow(
        new Error("No products selected")
      );
    });

    it("should throw an error when product is out of stock", async () => {
      const mockProductFacade: ProductAdmFacadeInterface = {
        addProduct: jest.fn().mockResolvedValue(null),
        checkStock: jest.fn((input: CheckStockFacadeInputDto) => Promise.resolve({
          productId: input.productId,
          stock: input.productId === "1" ? 0 : 1,
        })),
      };
      
      placeOrderUsecase["_productFacade"] = mockProductFacade;
      let input: PlaceOrderInputDto = {
        clientId: "0",
        products: [{ productId: "1" }],
      };
      await expect(placeOrderUsecase["validateProducts"](input)).rejects.toThrow(
        new Error("Product 1 is not available is stock")
      );
      input = {
        clientId: "0",
        products: [{ productId: "0" }, { productId: "1" }],
      };
      await expect(placeOrderUsecase["validateProducts"](input)).rejects.toThrow(
        new Error("Product 1 is not available is stock")
      );
      expect(mockProductFacade.checkStock).toHaveBeenCalledTimes(3);
      input = {
        clientId: "0",
        products: [{ productId: "0" }, { productId: "1" }, { productId: "2" }],
      };
      await expect(placeOrderUsecase["validateProducts"](input)).rejects.toThrow(
        new Error("Product 1 is not available is stock")
      );
      expect(mockProductFacade.checkStock).toHaveBeenCalledTimes(5);
    });

  });

  describe("getProducts method", () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    //@ts-expect-error - no params in constructor
    const placeOrderUsecase = new PlaceOrderUseCase();

    it("should throw an error when product is not found", async () => {
      const mockCatalogFacade = {
        find: jest.fn().mockResolvedValue(null),
      }
      //@ts-expect-error - force set catalogFacade
      placeOrderUsecase["_catalogFacade"] = mockCatalogFacade;
      await expect(placeOrderUsecase["getProduct"]("0")).rejects.toThrow(
        new Error("Product is not found")
      );
    });

    it("should return a product", async () => {
      const mockCatalogFacade = {
        find: jest.fn().mockResolvedValue({
          id: "0",
          name: "Product 0",
          description: "Product 0 description",
          salesPrice: 0,
        }),
      };
      //@ts-expect-error - force set catalogFacade
      placeOrderUsecase["_catalogFacade"] = mockCatalogFacade;
      await expect(placeOrderUsecase["getProduct"]("0")).resolves.toEqual(
        new Product({
          id: new Id("0"),
          name: "Product 0",
          description: "Product 0 description",
          salesPrice: 0
        })
      );
      expect(mockCatalogFacade.find).toHaveBeenCalledTimes(1);
    });

  });
  
  describe("execute method", () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });
    
    it("should throw an error when client is not found", async () => {
      const mockClientFacade: ClientAdmFacadeInterface = {
          find: jest.fn().mockResolvedValue(null),
          add: jest.fn().mockResolvedValue(null),
      };
      //@ts-expect-error - no params in constructor
      const placeOrderUseCase = new PlaceOrderUseCase(mockClientFacade);
      const input: PlaceOrderInputDto = { clientId: "0", products: [] };
      await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
        new Error("Client is not found")
      );
    });
    
    it("should throw an error when products are not valid", async () => {
      const mockClientFacade: ClientAdmFacadeInterface = {
        find: jest.fn().mockResolvedValue(true),
        add: jest.fn().mockResolvedValue(null),
      };
      const spyValidateProducts = jest.spyOn(
        PlaceOrderUseCase.prototype as any,
        "validateProducts"
      );
      //@ts-expect-error - no params in constructor
      const placeOrderUseCase = new PlaceOrderUseCase(mockClientFacade);
      const input: PlaceOrderInputDto = { clientId: "1", products: [] };
      await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
        new Error("No products selected")
      );
      expect(spyValidateProducts).toHaveBeenCalledTimes(1);
      spyValidateProducts.mockRestore();
    });

    describe("place an order", () => {
      const client = new Client({
        id: new Id("1"),
        name: "Client 0",
        document: "0000",
        email: "client@user.com",
        address: new Address("some street", "1", "", "some city", "some state", "000"),
      })
      const mockClientFacade: ClientAdmFacadeInterface = {
        find: jest.fn().mockResolvedValue(client),
        add: jest.fn(),
      };
      const mockPaymentFacade = {
        process: jest.fn(),
      };
      const mockCheckoutRepo: CheckoutGateway = {
        add: jest.fn(),
        find: jest.fn(),
      };
      const mockInvoiceFacade: InvoiceFacadeInterface = {
        find: jest.fn(),
        generate: jest.fn().mockResolvedValue({ id: "1i" }),
      };
      // create: jest.fn().mockResolvedValue({ id: "1i" }),
      const placeOrderUseCase = new PlaceOrderUseCase(
        mockClientFacade,
        null,
        null,
        mockInvoiceFacade,
        mockPaymentFacade,
        mockCheckoutRepo,
      );
      const products = {
        "1": new Product({
          id: new Id("1"),
          name: "Product 1",
          description: "some description",
          salesPrice: 40,
        }),
        "2": new Product({
          id: new Id("2"),
          name: "Product 2",
          description: "some description",
          salesPrice: 30,
        }),
      };
      const mockValidateProducts = jest
      //@ts-expect-error - spy on private method
      .spyOn(placeOrderUseCase, "validateProducts")
      //@ts-expect-error - spy on private method
      .mockResolvedValue(null);
      const mockGetProduct = jest
      //@ts-expect-error - spy on private method
      .spyOn(placeOrderUseCase, "getProduct")
      //@ts-expect-error - spy on private method
      .mockImplementation(( productId: keyof typeof products ) => {
        return products[productId];
      });

      beforeEach(() => {
        jest.clearAllMocks();
      });
      
      it("should not be approved", async () => {
        mockPaymentFacade.process = mockPaymentFacade.process.mockReturnValue({
          transactionId: "1t",
          orderId: "1o",
          amount: 100,
          status: "error",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const input: PlaceOrderInputDto = {
          clientId: "1c",
          products: [{ productId: "1" }, { productId: "2"}],
        };
        let output = await placeOrderUseCase.execute(input);
        expect(output.invoiceId).toBeNull();
        expect(output.total).toBe(70);
        expect(output.products).toStrictEqual([
          { productId: "1" },
          { productId: "2" },
        ]);
        expect(mockClientFacade.find).toHaveBeenCalledTimes(1);
        expect(mockClientFacade.find).toHaveBeenCalledWith({ id: "1c" });
        expect(mockValidateProducts).toHaveBeenCalledTimes(1);
        expect(mockValidateProducts).toHaveBeenCalledWith(input);
        expect(mockGetProduct).toHaveBeenCalledTimes(2);
        expect(mockCheckoutRepo.add).toHaveBeenCalledTimes(1);
        expect(mockPaymentFacade.process).toHaveBeenCalledTimes(1);
        expect(mockPaymentFacade.process).toHaveBeenCalledWith({ orderId: output.id, amount: output.total });
        expect(mockInvoiceFacade.generate).toHaveBeenCalledTimes(0);
      });

      it("should be approved", async () => {
        mockPaymentFacade.process = mockPaymentFacade.process.mockReturnValue({
          transactionId: "1t",
          orderId: "1d",
          amount: 100,
          status: "approved",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const input: PlaceOrderInputDto = {
          clientId: "1c",
          products: [{ productId: "1" }, { productId: "2" }],
        };

        let output = await placeOrderUseCase.execute(input);

        expect(output.invoiceId).toBe("1i");
        expect(output.total).toBe(70);
        expect(output.products).toStrictEqual([
          { productId: "1" },
          { productId: "2" },
        ]);
        expect(mockClientFacade.find).toHaveBeenCalledTimes(1);
        expect(mockClientFacade.find).toHaveBeenCalledWith({ id: "1c" });
        expect(mockValidateProducts).toHaveBeenCalledTimes(1);
        expect(mockGetProduct).toHaveBeenCalledTimes(2);
        expect(mockCheckoutRepo.add).toHaveBeenCalledTimes(1);
        expect(mockPaymentFacade.process).toHaveBeenCalledTimes(1);
        expect(mockPaymentFacade.process).toHaveBeenCalledWith({
          orderId: output.id,
          amount: output.total
        });
        expect(mockInvoiceFacade.generate).toHaveBeenCalledTimes(1);
        expect(mockInvoiceFacade.generate).toHaveBeenCalledWith({
          name: client.name,
          document: client.document,
          street: client.address.street,
          number: client.address.number,
          complement: client.address.complement,
          city: client.address.city,
          state: client.address.state,
          zipCode: client.address.zipCode,
          items: [
            {
              id: products["1"].id.id,
              name: products["1"].name,
              price: products["1"].salesPrice,
            },
            {
              id: products["2"].id.id,
              name: products["2"].name,
              price: products["2"].salesPrice,
            }
          ],
        });
      });
    });
  });
});