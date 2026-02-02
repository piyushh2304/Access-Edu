"use client";
import React from 'react';
import ArtworkTable from '../components/Artwork/ArtworkTable';
import Heading from '../utils/Heading';
import Header from '../components/Header';

const Page = () => {
  return (
    <div className="min-h-screen">
      <Heading
        title="Artwork Selection Demo"
        description="Demo of optimized artwork selection"
        keywords="Artwork, API, Selection"
      />
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <ArtworkTable />
      </div>
    </div>
  );
};

export default Page;
