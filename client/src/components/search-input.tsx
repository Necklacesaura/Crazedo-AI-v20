import { useState } from "react";
import { Search, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface SearchInputProps {
  onSearch: (term: string) => void;
  isLoading: boolean;
}

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [term, setTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      onSearch(term);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit} 
      className="relative w-full max-w-2xl mx-auto"
      data-testid="search-form"
    >
      <div className="relative flex items-center group">
        <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="text"
          placeholder="Enter a topic to analyze (e.g., 'AGI', 'Bitcoin', 'Climate')..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="pl-12 pr-32 h-16 text-lg bg-card/50 border-muted focus:border-primary/50 focus:ring-primary/20 rounded-xl backdrop-blur-sm shadow-lg transition-all"
          data-testid="input-search"
        />
        <div className="absolute right-2">
          <Button 
            type="submit" 
            disabled={isLoading || !term.trim()}
            className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all shadow-[0_0_15px_-3px_var(--color-primary)] hover:shadow-[0_0_20px_0px_var(--color-primary)]"
            data-testid="button-analyze"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Analyze <Sparkles className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.form>
  );
}
