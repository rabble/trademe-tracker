-- This migration creates the initial database schema for the application
-- Migration: 20250314000000_initial_schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Create tables
-- Properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    price NUMERIC NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    status TEXT NOT NULL CHECK (status IN ('active', 'under_offer', 'sold', 'archived')),
    days_on_market INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trademe_listing_id TEXT,
    url TEXT,
    image_urls TEXT[],
    description TEXT,
    user_notes TEXT,
    land_area NUMERIC,
    floor_area NUMERIC,
    property_type TEXT CHECK (property_type IN ('house', 'apartment', 'townhouse', 'section', 'other')),
    primary_image_url TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Property changes table
CREATE TABLE IF NOT EXISTS public.property_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('price', 'status', 'description')),
    old_value TEXT NOT NULL,
    new_value TEXT NOT NULL,
    change_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT
);

-- Property insights table
CREATE TABLE IF NOT EXISTS public.property_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('price_trend', 'market_comparison', 'recommendation')),
    insight_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Property images table
CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hash TEXT,
    size INTEGER,
    width INTEGER,
    height INTEGER
);

-- Saved filters table
CREATE TABLE IF NOT EXISTS public.saved_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filters JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_property_changes_property_id ON public.property_changes(property_id);
CREATE INDEX IF NOT EXISTS idx_property_insights_property_id ON public.property_insights(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON public.saved_filters(user_id);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_properties_title_trgm ON public.properties USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_address_trgm ON public.properties USING GIN (address gin_trgm_ops);

-- Set up Row Level Security (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Properties policies
CREATE POLICY "Users can view their own properties" 
    ON public.properties FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own properties" 
    ON public.properties FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own properties" 
    ON public.properties FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own properties" 
    ON public.properties FOR DELETE
    USING (user_id = auth.uid());

-- Property changes policies
CREATE POLICY "Users can view changes to their properties" 
    ON public.property_changes FOR SELECT
    USING (property_id IN (
        SELECT id FROM public.properties WHERE user_id = auth.uid()
    ));

-- Property insights policies
CREATE POLICY "Users can view insights for their properties" 
    ON public.property_insights FOR SELECT
    USING (property_id IN (
        SELECT id FROM public.properties WHERE user_id = auth.uid()
    ));

-- Property images policies
CREATE POLICY "Users can view images of their properties" 
    ON public.property_images FOR SELECT
    USING (property_id IN (
        SELECT id FROM public.properties WHERE user_id = auth.uid()
    ));

-- Saved filters policies
CREATE POLICY "Users can view their own saved filters" 
    ON public.saved_filters FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own saved filters" 
    ON public.saved_filters FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own saved filters" 
    ON public.saved_filters FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own saved filters" 
    ON public.saved_filters FOR DELETE
    USING (user_id = auth.uid());

-- Create functions
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
