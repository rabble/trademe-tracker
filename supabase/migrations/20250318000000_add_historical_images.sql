-- Add historical_images table to the schema
CREATE TABLE IF NOT EXISTS public.historical_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hash TEXT,
    size INTEGER,
    width INTEGER,
    height INTEGER
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_historical_images_property_id ON public.historical_images(property_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.historical_images ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view historical images of their properties" 
    ON public.historical_images FOR SELECT
    USING (property_id IN (
        SELECT id FROM public.properties WHERE user_id = auth.uid()
    ));
