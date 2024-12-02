// /api/withdraw.js

const { ethers } = require('ethers');
const express = require('express');
const cors = require('cors');
const app = express();

// Use CORS if necessary
app.use(cors());
app.use(express.json());

// Initialize provider and wallet securely on the backend
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

app.post('/api/withdraw', async (req, res) => {
  const { address, amount, confirmationTxHash } = req.body;

  if (!address || !amount || !confirmationTxHash) {
    return res.status(400).json({ error: 'Missing parameters.' });
  }

  try {
    // Verify the confirmation transaction
    const tx = await provider.getTransaction(confirmationTxHash);
    if (!tx) {
      return res.status(400).json({ error: 'Invalid transaction hash.' });
    }

    // Ensure the transaction is from the user to your server address with the correct amount
    if (
      tx.from.toLowerCase() !== address.toLowerCase() ||
      tx.to.toLowerCase() !== wallet.address.toLowerCase() ||
      !tx.value.eq(ethers.utils.parseEther('0.0003'))
    ) {
      return res.status(400).json({ error: 'Invalid transaction details.' });
    }

    // Send the withdrawal amount to the user's address
    const txWithdraw = await wallet.sendTransaction({
      to: address,
      value: ethers.utils.parseEther(amount.toString()),
    });

    await txWithdraw.wait();

    // Update balance in Supabase (implement this according to your setup)
    // Example using Supabase client
    const { data, error } = await supabase
      .from('TrumpSweeper')
      .select('balance')
      .eq('user', address)
      .single();

    if (error || !data) {
      return res.status(500).json({ error: 'Error fetching user balance.' });
    }

    const newBalance = parseFloat(data.balance) - parseFloat(amount);
    if (newBalance < 0) {
      return res.status(400).json({ error: 'Insufficient balance.' });
    }

    const { error: updateError } = await supabase
      .from('TrumpSweeper')
      .update({ balance: newBalance })
      .eq('user', address);

    if (updateError) {
      return res.status(500).json({ error: 'Error updating balance.' });
    }

    res.status(200).json({ message: 'Withdrawal successful', txHash: txWithdraw.hash });
  } catch (error) {
    console.error('Error during withdrawal:', error);
    res.status(500).json({ error: 'Withdrawal failed', details: error.message });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Backend server is running on port 3000');
});
