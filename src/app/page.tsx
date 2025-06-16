"use client";

import { useState, FormEvent, ChangeEvent, useEffect, useCallback } from 'react';
import type { MealDetail, MealDBFilterResponse, MealDBLookupResponse } from '@/types/recipe';
import RecipeCard from '@/components/recipe-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Info, ServerCrash, UtensilsCrossed, Loader2 } from 'lucide-react';

const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState<MealDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchRecipeDetails = useCallback(async (mealId: string): Promise<MealDetail | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/lookup.php?i=${mealId}`);
      if (!response.ok) {
        console.error(`Failed to fetch details for meal ${mealId}: ${response.statusText}`);
        return null;
      }
      const data: MealDBLookupResponse = await response.json();
      return data.meals && data.meals.length > 0 ? data.meals[0] : null;
    } catch (e) {
      console.error(`Error fetching details for meal ${mealId}:`, e);
      return null;
    }
  }, []);

  const performSearch = useCallback(async (currentSearchTerm: string) => {
    if (!currentSearchTerm.trim()) {
      setRecipes([]);
      setHasSearched(false); // Reset if search term is cleared
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipes([]);
    setHasSearched(true);

    try {
      const response = await fetch(`${API_BASE_URL}/filter.php?i=${currentSearchTerm.trim().replace(/ /g, '_')}`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data: MealDBFilterResponse = await response.json();

      if (data.meals && data.meals.length > 0) {
        const detailedRecipesPromises = data.meals.slice(0, 12).map(meal => fetchRecipeDetails(meal.idMeal)); // Limit to 12 results to avoid too many API calls
        const detailedRecipesResults = await Promise.all(detailedRecipesPromises);
        const validDetailedRecipes = detailedRecipesResults.filter(Boolean) as MealDetail[];
        
        setRecipes(validDetailedRecipes);

        if (validDetailedRecipes.length === 0 && data.meals.length > 0) {
            setError("Found some recipes, but could not fetch their details. They might have incomplete data in the database.");
        }
      } else {
        setRecipes([]);
      }
    } catch (e: any) {
      console.error("Search error:", e);
      setError(`Failed to fetch recipes: ${e.message}. Please check your internet connection or try again later.`);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecipeDetails]);
  
  useEffect(() => {
    const debouncedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
         performSearch(searchTerm);
      } else {
        // Clear results if search term is empty after debounce
        setRecipes([]);
        setHasSearched(false);
        setError(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(debouncedSearch);
  }, [searchTerm, performSearch]);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The useEffect with searchTerm dependency already handles the search.
    // This explicit call can be used if immediate search on submit is desired,
    // overriding debounce for this specific action.
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-6 lg:p-8 font-body">
      <header className="w-full max-w-4xl text-center my-8 sm:my-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-bold text-primary mb-3">Recipe Radar</h1>
        <p className="text-md sm:text-lg text-muted-foreground">
          Discover delicious recipes by ingredient. Start typing below!
        </p>
      </header>

      <form onSubmit={handleFormSubmit} className="w-full max-w-xl mb-10 sm:mb-12 flex items-center gap-3">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          placeholder="e.g., chicken breast, salmon, broccoli"
          className="flex-grow !text-base h-12 px-4 rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent"
          aria-label="Search for recipes by ingredient"
        />
        <Button 
          type="submit" 
          size="lg"
          className="bg-accent text-accent-foreground h-12 px-6 rounded-lg shadow-md hover:bg-opacity-90 focus-visible:ring-accent transition-colors flex items-center justify-center"
          disabled={isLoading}
          aria-label="Search recipes"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </Button>
      </form>

      <main className="w-full max-w-7xl">
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">Radar is scanning for recipes...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="w-full max-w-md mx-auto text-center bg-destructive/10 border border-destructive/30 text-destructive px-4 py-5 rounded-lg shadow" role="alert">
              <div className="flex items-center justify-center mb-2">
                  <ServerCrash className="w-8 h-8 mr-3" />
                  <strong className="font-bold font-headline text-xl">Oh no! A kitchen mishap!</strong>
              </div>
              <p className="text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && hasSearched && recipes.length === 0 && (
          <div className="w-full max-w-md mx-auto text-center bg-accent/10 border border-accent/30 text-accent-foreground px-4 py-5 rounded-lg shadow" role="alert">
            <div className="flex items-center justify-center mb-2">
                <UtensilsCrossed className="w-8 h-8 mr-3 text-accent" />
                <strong className="font-bold font-headline text-xl text-accent">No Recipes Found!</strong>
            </div>
            <p className="text-sm">We couldn't find any recipes for "{searchTerm}". Try a different ingredient or check your spelling!</p>
          </div>
        )}

        {!isLoading && !error && recipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
            {recipes.map(recipe => (
              <RecipeCard key={recipe.idMeal} recipe={recipe} />
            ))}
          </div>
        )}
        
        {!isLoading && !error && !hasSearched && (
          <div className="text-center text-muted-foreground py-10">
              <Info className="w-12 h-12 mx-auto mb-4 text-accent" />
              <p className="text-xl font-headline">What are you cooking today?</p>
              <p className="text-md">Enter an ingredient above to start your culinary adventure!</p>
          </div>
        )}
      </main>
      <footer className="w-full max-w-4xl text-center mt-12 sm:mt-16 py-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Recipe Radar - Powered by <a href="https://www.themealdb.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TheMealDB API</a>.
        </p>
      </footer>
    </div>
  );
}
