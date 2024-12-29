import { LikesList } from "./likes-list"
import { DislikesList } from "./dislikes-list"

export function LikesDislikesGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <LikesList />
      <DislikesList />
    </div>
  )
} 