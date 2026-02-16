import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sets from "./pages/Sets";
import SetView from "./pages/SetView";
import CreateSet from "./pages/CreateSet";
import EditSet from "./pages/EditSet";
import Quiz from "./pages/Quiz";
import Settings from "./pages/Settings";
import InfiniteScroll from "./pages/InfiniteScroll";
import SavedCards from "./pages/SavedCards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Sets />} />
        <Route path="/set/:id" element={<SetView />} />
        <Route path="/create" element={<CreateSet />} />
        <Route path="/edit/:id" element={<EditSet />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/scroll" element={<InfiniteScroll />} />
        <Route path="/saved" element={<SavedCards />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
