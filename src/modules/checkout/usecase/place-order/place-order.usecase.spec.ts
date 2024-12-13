import ClientAdmFacadeInterface, { AddClientFacadeInputDto } from "../../../client-adm/facade/client-adm.facade.interface";
import ProductAdmFacadeInterface, { AddProductFacadeInputDto, CheckStockFacadeInputDto, CheckStockFacadeOutputDto } from "../../../product-adm/facade/product-adm.facade.interface";
import { PlaceOrderInputDto } from "./place-order.dto";
import PlaceOrderUseCase from "./place-order.usecase";

describe("PlaceOrderUseCase unit test", () => {
  
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
  
  describe("execute method", () => {
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
  });
});