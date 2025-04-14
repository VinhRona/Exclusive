import { IProduct } from "./product";

export interface ICart {
    carts:IProductCart[],
    isOpenCart:boolean
}

export interface IProductCart {
  productId: IProduct;
  quantity: number;
}
export enum CartActionType{
    "UpdateCart",
    "ChangeStatusCart"
}