import ClientAdmFacadeInterface, { AddClientFacadeInputDto } from "../../../client-adm/facade/client-adm.facade.interface";
import { PlaceOrderInputDto } from "./place-order.dto";
import PlaceOrderUseCase from "./place-order.usecase";

describe("PlaceOrderUseCase unit test", () => {
  describe("execute method", () => {
    it("should throw an error when client is not found", async () => {
      const mockClientFacade: ClientAdmFacadeInterface = {
          find: jest.fn().mockResolvedValue(null),
          add: jest.fn().mockResolvedValue(null),
      };
      const placeOrderUseCase = new PlaceOrderUseCase(mockClientFacade);
      const input: PlaceOrderInputDto = { clientId: "0", products: [] };
      await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
        new Error("Client is not found")
      );
    });
  })  
})