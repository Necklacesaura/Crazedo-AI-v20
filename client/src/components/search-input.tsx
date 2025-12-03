import { useState, useEffect } from "react";
import { Search, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  onSearch: (term: string) => void;
  isLoading: boolean;
}

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }

    // Generate instant suggestions based on typing
    setSuggestions([
      `${term} news`,
      `${term} today`,
      `${term} 2025`,
      `best ${term}`,
    ]);
  }, [term]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      onSearch(term);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearch(suggestion);
    setSuggestions([]);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative w-full max-w-2xl mx-auto"
      data-testid="search-form"
    >
      <div className="relative">
        <div className="relative flex items-center group">
          <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Enter a topic to analyze (e.g., 'AGI', 'Bitcoin', 'Climate')..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="pl-12 pr-32 h-16 text-lg bg-card/50 border-muted focus:border-primary/50 focus:ring-primary/20 rounded-xl backdrop-blur-sm shadow-lg transition-all"
            data-testid="input-search"
            autoComplete="off"
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

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-muted rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
            data-testid="suggestions-dropdown"
          >
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-muted/50 last:border-b-0 flex items-center justify-between group"
                data-testid={`suggestion-${i}`}
                type="button"
              >
                <span className="text-foreground group-hover:text-primary">{suggestion}</span>
                <Search className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
