"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Heart, Share, ShoppingCart, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { type Product, mockProducts } from "@/lib/products";

import { ProductClientPage } from "@/components/product-client-page";

// This is a server component that doesn't use "use client"
export default function ProductPage() {
  return <ProductClientPage />;
}
