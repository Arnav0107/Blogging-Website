import CommentField from "./comment-field.component";
import CommentCard from "./comment-card.component";

const CommentsPanel = ({ blogId, blogTitle, comments, onClose, onCommentAdded }) => {
  return (
    <div className="fixed top-0 right-0 z-50 w-[350px] h-full bg-white border-l border-grey flex flex-col shadow-2xl max-sm:w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-grey">
        <div>
          <h3 className="font-medium text-lg">Comments</h3>
          <p className="text-dark-grey text-sm line-clamp-1">{blogTitle}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-grey"
        >
          <i className="fi fi-rr-cross text-lg leading-none" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* New comment */}
        <div className="mb-6">
          <CommentField blogId={blogId} onCommentAdded={onCommentAdded} />
        </div>

        {/* Comment list */}
        {comments.length === 0 ? (
          <p className="text-dark-grey text-center mt-8">No comments yet. Be the first!</p>
        ) : (
          comments.map((c) => (
            <CommentCard
              key={c._id}
              comment={c}
              blogId={blogId}
              onCommentAdded={onCommentAdded}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsPanel;