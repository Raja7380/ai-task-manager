// Re-export the NextAuth request handlers generated in src/auth.ts.
// The `[...nextauth]` catch-all route forwards all /api/auth/* requests.
import { handlers } from "@/auth";
export const { GET, POST } = handlers;

// NextAuth needs access to request.url; the Node.js runtime is required
// for the Credentials provider because we call bcrypt in `authorize`.
export const runtime = "nodejs";
