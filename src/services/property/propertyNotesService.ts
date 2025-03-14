import { supabase } from '../../lib/supabase';

export const PropertyNotesService = {
  /**
   * Save notes for a property
   * @param propertyId The ID of the property
   * @param notes The notes to save
   * @returns Promise that resolves when the notes are saved
   */
  async saveNotes(propertyId: string, notes: string): Promise<void> {
    try {
      console.log(`[PropertyNotesService] Saving notes for property ${propertyId}:`, notes);
      console.log(`[PropertyNotesService] Property ID type:`, typeof propertyId);
      
      // Check if the property exists
      console.log(`[PropertyNotesService] Checking if property exists...`);
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id, user_notes')
        .eq('id', propertyId)
        .single();
      
      console.log(`[PropertyNotesService] Property check result:`, { property, error: propertyError });
      
      if (propertyError) {
        console.error('[PropertyNotesService] Error fetching property for notes update:', propertyError);
        throw propertyError;
      }
      
      // Update the property with the new notes
      console.log(`[PropertyNotesService] Updating property with new notes...`);
      const { data: updateData, error: updateError } = await supabase
        .from('properties')
        .update({ user_notes: notes })
        .eq('id', propertyId)
        .select();
      
      console.log(`[PropertyNotesService] Update result:`, { data: updateData, error: updateError });
      
      if (updateError) {
        console.error('[PropertyNotesService] Error updating property notes:', updateError);
        throw updateError;
      }
      
      console.log(`[PropertyNotesService] Notes saved successfully for property ${propertyId}`);
    } catch (error) {
      console.error('Error in saveNotes:', error);
      throw error;
    }
  },
  
  /**
   * Get notes for a property
   * @param propertyId The ID of the property
   * @returns Promise that resolves with the property notes
   */
  async getNotes(propertyId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('user_notes')
        .eq('id', propertyId)
        .single();
      
      if (error) {
        console.error('Error fetching property notes:', error);
        throw error;
      }
      
      return data?.user_notes || null;
    } catch (error) {
      console.error('Error in getNotes:', error);
      throw error;
    }
  }
};
