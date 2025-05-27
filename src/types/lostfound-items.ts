export interface IContactInfo {
  name: string,
  contactNo: string,
  address?: string,
}

export interface IImage {
  fileName: string,
  fileType: string,
  fileBase64: string
} 

export interface IItem {
  title: string,
  description?: string,
  images?: IImage[]
}

export interface ILostOrFoundItem extends IItem {
  publisherEmail: string,
  isFoundItem: boolean,
  contactInfo: IContactInfo
  lostOrFoundDate?: string
}

