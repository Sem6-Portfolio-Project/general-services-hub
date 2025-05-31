export interface IContactInfo {
  name: string,
  contactNo: string,
  address?: string,
}

export interface IDocument {
  fileName: string,
  fileType: string,
} 

export interface IItem {
  title: string,
  description?: string,
  images?: string[]
}

export interface ILostOrFoundItem extends IItem {
  publisherEmail: string,
  isFoundItem: boolean,
  contactInfo: IContactInfo
  lostOrFoundDate?: string
}

