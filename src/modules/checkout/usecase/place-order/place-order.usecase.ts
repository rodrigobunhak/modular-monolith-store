import UseCaseInterface from "../../../@shared/usecase/usecase.interface";
import ClientAdmFacadeInterface from "../../../client-adm/facade/client-adm.facade.interface";
import { PlaceOrderInputDto, PlaceOrderOutputDto } from "./place-order.dto";

export default class PlaceOrderUseCase implements UseCaseInterface {
  private _clientFacade: ClientAdmFacadeInterface;
  constructor(clientFacade: ClientAdmFacadeInterface) {
    this._clientFacade = clientFacade;
  }

  async execute(input: PlaceOrderInputDto): Promise<PlaceOrderOutputDto> {
    
    // buscar o client. caso nao encontre -> client not found
    const client = await this._clientFacade.find({ id: input.clientId });
    if (!client) {
      throw new Error("Client is not found");
    }

    // validar produto.

    // recuperar os produtos

    // criar o objeto do client

    // criar o objeto da order (client, products)

    // processar o pagamento -> paymentFacade.process (orderId, amount)

    // caso pagamento seja aprovado. -> Gerar invoice

    // mudar o status da order para aprovada

    // retornar dto
    
    throw new Error("Method not implemented.");
  }
}