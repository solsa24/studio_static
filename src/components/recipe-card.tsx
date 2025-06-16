"use client";

import Image from 'next/image';
import type { MealDetail } from '@/types/recipe';
import { MapPin, ChefHat, Leaf } from 'lucide-react';

interface RecipeCardProps {
  recipe: MealDetail;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const briefDescription = recipe.strInstructions ? recipe.strInstructions.substring(0, 120) + "..." : "No description available.";
  const isVegetarian = recipe.strCategory === "Vegetarian" || recipe.strTags?.toLowerCase().includes("vegetarian");

  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 flex flex-col h-full group">
      <div className="relative w-full h-48 sm:h-56">
        <Image
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-300 group-hover:scale-110"
          data-ai-hint="food recipe photography"
          priority={false} // Set to true for above-the-fold images if applicable
        />
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      </div>
      <div className="p-4 md:p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-headline font-semibold mb-2 text-primary group-hover:text-accent transition-colors duration-300">{recipe.strMeal}</h3>
        <p className="text-sm text-muted-foreground mb-4 flex-grow font-body leading-relaxed">{briefDescription}</p>
        <div className="mt-auto space-y-2 text-xs font-body">
          {recipe.strArea && (
            <div className="flex items-center text-muted-foreground" aria-label={`Origin: ${recipe.strArea}`}>
              <MapPin className="w-4 h-4 mr-2 text-accent flex-shrink-0" />
              <span>{recipe.strArea}</span>
            </div>
          )}
          {recipe.strCategory && (
            <div className="flex items-center text-muted-foreground" aria-label={`Category: ${recipe.strCategory}`}>
              <ChefHat className="w-4 h-4 mr-2 text-accent flex-shrink-0" />
              <span>{recipe.strCategory}</span>
            </div>
          )}
          {isVegetarian && (
            <div className="flex items-center text-green-600 dark:text-green-400" aria-label="Vegetarian recipe">
              <Leaf className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Vegetarian</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
