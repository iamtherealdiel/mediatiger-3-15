import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import MessagePanel from "../components/MessagePanel";
import { adminId } from "./AdminPanel";

interface AdminUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
  };
}

export default function Messages() {
  const { user } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  // Move the messages useEffect here, before the early return
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      try {
        const { data: messages, error } = await supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: true });

        console.log("Fetched messages:", messages); // Debug log
        if (error) throw error;
        setMessages(messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${user.id} OR receiver_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Real-time update received:", payload); // Debug log
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    const loadAdminUser = async () => {
      if (!user) return;

      try {
        // If user is admin, they need to see all users
        const isAdmin = user.user_metadata?.role === "admin";
        console.log(user.user_metadata);
        if (isAdmin) {
          // Admin sees all users with pending/approved applications
          const { data: users, error } = await supabase
            .from("user_requests")
            .select("user_id")
            .in("status", ["pending", "approved"])
            .limit(1)
            .single();

          if (error) throw error;

          // Get user details
          const { data: userData, error: userError } =
            await supabase.auth.admin.getUserById(users.user_id);

          if (userError) throw userError;
          setAdminUser(userData.user as AdminUser);
        } else {
          // Regular user sees admin
          const { data: adminUsers, error } =
            await supabase.auth.admin.listUsers();

          if (error) throw error;

          const admin = adminUsers.users.find(
            (u) => u.user_metadata?.role === "admin"
          );
          if (admin) {
            setAdminUser(admin as AdminUser);
          }
        }
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminUser();
  }, [user]);

  if (!user) return null;

  const isAdmin = user.user_metadata.role === "admin";
  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      console.log(messages);
      if (error) throw error;
      setMessages(messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${user.id} OR receiver_id=eq.${user.id}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);
  // Add file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Add file upload handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Modify handleSendMessage to handle file uploads
  const handleSendMessage = async () => {
    if (!user) return;

    try {
      let fileUrl = "";
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from("message-images")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("message-images").getPublicUrl(filePath);

        fileUrl = publicUrl;
      }

      const { error } = await supabase.from("messages").insert([
        {
          sender_id: user.id,
          receiver_id: adminId,
          content: newMessage.trim(),
          image_url: fileUrl || null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      setNewMessage("");
      setSelectedFile(null);
      setIsModalOpen(false);
      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Modify renderMessage to display files
  const renderMessage = (message: any) => {
    const isCurrentUser = message.sender_id === user?.id;
    return (
      <div
        key={message.id}
        className="flex items-center p-4 hover:bg-slate-700/50 transition-colors cursor-pointer border-b border-slate-700/50"
      >
        <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center mr-4">
          <MessageSquare className="h-6 w-6 text-indigo-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">
              {isCurrentUser
                ? "You"
                : adminUser?.user_metadata.full_name || "Admin"}
            </h3>
            <span className="text-xs text-slate-400">
              {new Date(message.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-slate-300 truncate">{message.content}</p>
          {message.image_url && (
            <a
              href={message.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300"
            >
              📎 {message.image_url || "Attachment"}
            </a>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to={isAdmin ? "/purple" : "/dashboard"}
            className="inline-flex items-center text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to {isAdmin ? "Admin Panel" : "Dashboard"}
          </Link>
        </div>

        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mr-4">
              <MessageSquare className="h-6 w-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
              Messages
            </h1>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200 flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                New Message
              </button>
            </div>
          </div>
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-slate-800 p-6 rounded-xl shadow-xl max-w-lg w-full mx-4">
                <h2 className="text-xl font-bold text-white mb-4">
                  New Message
                </h2>
                <textarea
                  className="w-full h-32 bg-slate-700 text-white rounded-lg p-3 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Attach File (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/png, image/gif, image/jpeg"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-slate-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-indigo-500 file:text-white
              hover:file:bg-indigo-600
              file:cursor-pointer"
                  />
                  {selectedFile && (
                    <div className="mt-2 text-sm text-slate-400">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setNewMessage("");
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !selectedFile}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : adminUser ? (
            <div className="flex flex-col h-[calc(100vh-16rem)]">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
                {messages && messages.length > 0 ? (
                  messages.map((message) => renderMessage(message))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    No messages yet. Start a conversation!
                  </div>
                )}
              </div>
              <MessagePanel
                userId={user.id}
                isAdmin={isAdmin}
                otherUserId={adminUser.id}
                userName={adminUser.user_metadata.full_name || adminUser.email}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
              {messages && messages.length > 0 ? (
                messages.map((message) => renderMessage(message))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No messages yet. Start a conversation!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  // In the render section, add a debug log
  console.log("Current messages state:", messages); // Debug log
}
