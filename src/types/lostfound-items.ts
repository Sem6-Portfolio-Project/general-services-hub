export interface ILostItemOwner {
  name: string,
  contactNo: string,
  address?: string,
}

export interface IItem {
  name: string,
  description?: string,
  imageUrls?: string[]
}

export interface ILostItemReq extends IItem {
  owner: ILostItemOwner
  lostDate: string
}

export interface IFoundItemReq extends IItem{
  foundDate: string
}
