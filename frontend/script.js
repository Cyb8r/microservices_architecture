document.addEventListener("DOMContentLoaded", function () {
    const postForm = document.getElementById("postForm");
    const postsContainer = document.getElementById("posts");

    // Fetch and display posts
    async function fetchPosts() {
        postsContainer.innerHTML = "Loading posts...";
        try {
            const res = await fetch("http://localhost:4000/posts");
            const posts = await res.json();
            postsContainer.innerHTML = "";
            Object.values(posts).forEach(post => renderPost(post));
        } catch (error) {
            postsContainer.innerHTML = "Failed to load posts.";
        }
    }

    // Render a single post with comment section
    function renderPost(post) {
        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerHTML = `
            <p><strong>${post.text}</strong> (User: ${post.userId})</p>
            <button onclick="deletePost('${post.id}')">Delete</button>
            <div class="comment-section">
                <input type="text" placeholder="Add a comment" id="comment-${post.id}">
                <button onclick="addComment('${post.id}')">Comment</button>
                <div id="comments-${post.id}"></div>
            </div>
        `;
        postsContainer.appendChild(postElement);
        fetchComments(post.id);
    }

    // Create a post
    postForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = document.getElementById("postText").value;
        const userId = document.getElementById("userId").value;
        
        const res = await fetch("http://localhost:4000/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, userId })
        });
        
        if (res.ok) fetchPosts();
    });

    // Delete a post
    async function deletePost(postId) {
        await fetch(`http://localhost:4000/posts/${postId}`, { method: "DELETE" });
        fetchPosts();
    }

    // Fetch comments for a post
    async function fetchComments(postId) {
        const commentsContainer = document.getElementById(`comments-${postId}`);
        commentsContainer.innerHTML = "Loading comments...";
        try {
            const res = await fetch(`http://localhost:4001/posts/${postId}/comments`);
            const comments = await res.json();
            commentsContainer.innerHTML = "";
            comments.forEach(comment => {
                const commentElement = document.createElement("p");
                commentElement.textContent = `${comment.text} (User: ${comment.userId})`;
                commentsContainer.appendChild(commentElement);
            });
        } catch (error) {
            commentsContainer.innerHTML = "Failed to load comments.";
        }
    }

    // Add a comment
    async function addComment(postId) {
        const commentInput = document.getElementById(`comment-${postId}`);
        const text = commentInput.value;
        const userId = "default_user"; // Replace with actual user logic

        await fetch(`http://localhost:4001/posts/${postId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, userId })
        });
        fetchComments(postId);
    }

    fetchPosts();
});
