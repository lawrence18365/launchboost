-- Function to atomically increment deal clicks count
CREATE OR REPLACE FUNCTION increment_clicks(deal_id UUID)
RETURNS INTEGER AS $$
BEGIN
  UPDATE deals 
  SET clicks_count = COALESCE(clicks_count, 0) + 1
  WHERE id = deal_id;
  
  RETURN (SELECT COALESCE(clicks_count, 0) FROM deals WHERE id = deal_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;