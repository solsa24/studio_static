
"use client";

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MealDetail, MealDBLookupResponse } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, MapPin, ChefHat, Utensils, AlertTriangle, Loader2 } from 'lucide-react';

const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

interface RecipePageParams {
  params: { id: string };
}

interface IngredientMeasure {
  ingredient: string;
  measure: string;
}

export default function RecipePage({ params }: RecipePageParams) {
  const { id: mealId } = params;
  const [recipe, setRecipe] = useState<MealDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipeDetails = useCallback(async (id: string): Promise<MealDetail | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/lookup.php?i=${id}`);
      if (!response.ok) {
        console.error(`Failed to fetch details for meal ${id}: ${response.statusText}`);
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data: MealDBLookupResponse = await response.json();
      return data.meals && data.meals.length > 0 ? data.meals[0] : null;
    } catch (e: any) {
      console.error(`Error fetching details for meal ${id}:`, e);
      setError(`Failed to load recipe details: ${e.message}. Please try again later.`);
      return null;
    }
  }, []);

  useEffect(() => {
    if (mealId) {
      setIsLoading(true);
      setError(null);
      fetchRecipeDetails(mealId)
        .then(data => {
          if (data) {
            setRecipe(data);
          } else {
            setError("Recipe not found or could not be loaded.");
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [mealId, fetchRecipeDetails]);

  const getIngredients = (meal: MealDetail): IngredientMeasure[] => {
    const ingredients: IngredientMeasure[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredientKey = `strIngredient${i}` as keyof MealDetail;
      const measureKey = `strMeasure${i}` as keyof MealDetail;
      const ingredient = meal[ingredientKey];
      const measure = meal[measureKey];
      if (ingredient && ingredient.trim() !== "") {
        ingredients.push({ ingredient, measure: measure || "" });
      }
    }
    return ingredients;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 font-body">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl font-semibold text-muted-foreground">Loading recipe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 font-body text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Recipe</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild variant="outline">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 font-body text-center">
        <Utensils className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-2">Recipe Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find the recipe you were looking for.</p>
        <Button asChild variant="outline">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>
      </div>
    );
  }

  const ingredientsList = getIngredients(recipe);

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="overflow-hidden shadow-xl">
          <div className="relative w-full h-64 sm:h-80 md:h-96">
            {recipe.strMealThumb ? (
              <Image
                src={recipe.strMealThumb}
                alt={recipe.strMeal}
                fill
                style={{ objectFit: 'cover' }}
                priority
                data-ai-hint="food cooking recipe"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Utensils className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-white shadow-md">
                {recipe.strMeal}
              </h1>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="mb-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {recipe.strCategory && (
                <div className="flex items-center">
                  <ChefHat className="w-5 h-5 mr-2 text-accent" />
                  <span>Category: <strong>{recipe.strCategory}</strong></span>
                </div>
              )}
              {recipe.strArea && (
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-accent" />
                  <span>Cuisine: <strong>{recipe.strArea}</strong></span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h2 className="text-2xl font-headline font-semibold mb-4 text-primary">Ingredients</h2>
                {ingredientsList.length > 0 ? (
                  <ul className="space-y-2 text-foreground">
                    {ingredientsList.map((item, index) => (
                      <li key={index} className="flex justify-between pb-1 border-b border-dashed border-border last:border-b-0">
                        <span>{item.ingredient}</span>
                        <span className="text-muted-foreground">{item.measure}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No ingredients listed.</p>
                )}
              </div>

              <div className="md:col-span-2">
                <h2 className="text-2xl font-headline font-semibold mb-4 text-primary">Instructions</h2>
                {recipe.strInstructions ? (
                  <div 
                    className="prose prose-sm sm:prose-base max-w-none text-foreground leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: recipe.strInstructions.replace(/\r\n|\n|\r/g, '<br />') }} 
                  />
                ) : (
                  <p className="text-muted-foreground">No instructions provided.</p>
                )}
              </div>
            </div>
            
            {recipe.strYoutube && recipe.strYoutube.includes('v=') && (
              <div className="mt-8 pt-6 border-t border-border">
                <h2 className="text-2xl font-headline font-semibold mb-4 text-primary">Watch Video</h2>
                <div className="aspect-video rounded-lg overflow-hidden shadow">
                  <iframe
                    src={`https://www.youtube.com/embed/${recipe.strYoutube.split('v=')[1].split('&')[0]}`}
                    title={`YouTube video: ${recipe.strMeal}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}

            {recipe.strSource && (
               <div className="mt-8 pt-6 border-t border-border text-center">
                 <Button variant="link" asChild>
                    <a href={recipe.strSource} target="_blank" rel="noopener noreferrer">
                        View Original Source
                    </a>
                 </Button>
               </div>
            )}

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
