"use client";

import { Suspense, useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import { doc, getDoc } from "firebase/firestore";

import type { Product } from "@/lib/types";

import { db } from "@/lib/firestore";

import { useAuth } from "@/contexts/AuthContext";

import { AppLayout } from "@/components/AppLayout";

import { ProductForm } from "@/components/ProductForm";

import { ProductList } from "@/components/ProductList";

import { SectionTitle } from "@/components/ui/SectionTitle";

function ProdutosContent() {
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const { organizationId } = useAuth();

  const searchParams = useSearchParams();

  useEffect(() => {
    const editId = searchParams.get("edit");
    const orgId = organizationId;

    if (!editId || !orgId) {
      return;
    }

    const productRef = doc(db, "organizations", orgId, "produtos", editId);

    async function loadProduct() {
      const snap = await getDoc(productRef);

      if (snap.exists()) {
        setEditingProduct({
          id: snap.id,
          ...snap.data(),
        } as Product);
      }
    }

    loadProduct();
  }, [searchParams, organizationId]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <SectionTitle
          title="Produtos"
          description="Gerencie os produtos da loja"
        />

        <ProductForm
          key={editingProduct?.id ?? "new-product"}
          editingProduct={editingProduct}
          onFinishEdit={() => {
            setEditingProduct(null);
          }}
          onProductCreated={() => {
            // ProductList usa onSnapshot em tempo real
          }}
        />

        <ProductList
          onEditProduct={(product) => {
            setEditingProduct(product);
          }}
        />
      </div>
    </AppLayout>
  );
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={null}>
      <ProdutosContent />
    </Suspense>
  );
}