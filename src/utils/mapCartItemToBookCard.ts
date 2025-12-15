import { IBookCard } from "../types/types"

export const mapCartItemToBookCard = (item: any): IBookCard => ({
  isbn13: item.bookId,
  title: item.title,
  subtitle: "",
  price: typeof item.price === "number" ? `${item.price} $` : item.price,
  image: item.base64CoverImage
    ? `data:image/jpeg;base64,${item.base64CoverImage}`
    : item.image || "/placeholder.png",
  url: `/books/${item.bookId}`,
  authors: "",
  publisher: "",
  pages: "",
  desc: "",
})
