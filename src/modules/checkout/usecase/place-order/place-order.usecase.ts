import UseCaseInterface from "../../../@shared/usecase/usecase.interface";
import { PlaceOrderInputDto, PlaceOrderOutputDto } from "./place-order.dto";

export default class PlaceOrderUseCase implements UseCaseInterface {
  
  constructor() {}

  execute(input: PlaceOrderInputDto): Promise<PlaceOrderOutputDto> {
    
    // buscar o client. caso nao encontre -> client not found

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