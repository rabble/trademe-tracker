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
      console.log(`[PropertyNotesService] ==================== START SAVE NOTES ====================`);
      console.log(`[PropertyNotesService] Saving notes for property ${propertyId}:`, notes);
      console.log(`[PropertyNotesService] Property ID type:`, typeof propertyId);
      console.log(`[PropertyNotesService] Property ID length:`, propertyId.length);
      console.log(`[PropertyNotesService] Notes length:`, notes.length);
      console.log(`[PropertyNotesService] Supabase URL:`, supabase.supabaseUrl);
      
      // Validate property ID format (UUID or numeric)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const numericRegex = /^\d+$/;
      
      if (!uuidRegex.test(propertyId) && !numericRegex.test(propertyId)) {
        console.error('[PropertyNotesService] Invalid property ID format:', propertyId);
        throw new Error('Invalid property ID format');
      }
      
      console.log(`[PropertyNotesService] Property ID format is valid`);
      
      // Check if the property exists
      console.log(`[PropertyNotesService] Checking if property exists...`);
      const { data: property, error: propertyError, status: propertyStatus } = await supabase
        .from('properties')
        .select('id, user_notes')
        .eq('id', propertyId)
        .single();
      
      console.log(`[PropertyNotesService] Property check result:`, { 
        property, 
        error: propertyError, 
        status: propertyStatus,
        propertyExists: !!property,
        errorCode: propertyError?.code,
        errorMessage: propertyError?.message
      });
      
      if (propertyError) {
        console.error('[PropertyNotesService] Error fetching property for notes update:', propertyError);
        console.error('[PropertyNotesService] Full error details:', JSON.stringify(propertyError));
        throw propertyError;
      }
      
      // Update the property with the new notes
      console.log(`[PropertyNotesService] Updating property with new notes...`);
      console.log(`[PropertyNotesService] Current notes in DB:`, property?.user_notes);
      
      const updateQuery = supabase
        .from('properties')
        .update({ user_notes: notes })
        .eq('id', propertyId)
        .select();
        
      console.log(`[PropertyNotesService] Update query:`, updateQuery.url);
      
      const { data: updateData, error: updateError, status: updateStatus } = await updateQuery;
      
      console.log(`[PropertyNotesService] Update result:`, { 
        data: updateData, 
        error: updateError, 
        status: updateStatus,
        updateSuccessful: !!updateData && updateData.length > 0,
        errorCode: updateError?.code,
        errorMessage: updateError?.message
      });
      
      if (updateError) {
        console.error('[PropertyNotesService] Error updating property notes:', updateError);
        console.error('[PropertyNotesService] Full error details:', JSON.stringify(updateError));
        throw updateError;
      }
      
      console.log(`[PropertyNotesService] Notes saved successfully for property ${propertyId}`);
      console.log(`[PropertyNotesService] ==================== END SAVE NOTES ====================`);
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
