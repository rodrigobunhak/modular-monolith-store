import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript" 
import InvoiceModel from "./invoice.model";

@Table({
  tableName: "products",
  timestamps: false
})
export class ItemModel extends Model {
  
  @PrimaryKey
  @Column({ allowNull: false })
  id: string;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false })
  price: number;

  @ForeignKey(() => InvoiceModel)
  @Column({ allowNull: false })
  invoice_id: string;

  @BelongsTo(() => InvoiceModel) // ? Essa referencia é necessária mesmo?
  invoice: InvoiceModel;

  @Column({ allowNull: false })
  createdAt: Date;

  @Column({ allowNull: false })
  updatedAt: Date;
}