// src/utils/updateUserBalance.js
import { supabase } from '../SupabaseClient';

// Function to deduct or add balance
export const updateUserBalance = async (walletAddress, amount, type) => {
  try {
    const { data, error } = await supabase
      .from('TrumpSweeper')
      .select('balance')
      .eq('user', walletAddress)
      .single();

    if (error) throw error;

    let newBalance = parseFloat(data.balance);
    newBalance = type === 'deduct' ? newBalance - parseFloat(amount) : newBalance + parseFloat(amount);

    // Update balance in Supabase
    const { error: upsertError } = await supabase
      .from('TrumpSweeper')
      .upsert({ user: walletAddress, balance: newBalance }, { onConflict: 'user' });

    if (upsertError) throw upsertError;

    return { success: true, balance: newBalance };
  } catch (error) {
    console.error('Error updating balance:', error);
    return { success: false, error: error.message };
  }
};
