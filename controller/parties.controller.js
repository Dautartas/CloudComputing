import createError from 'http-errors';
import {
  getParties,
  getPartyById,
  deletePartyById,
  addParty,
  updateParty,
} from '../model/party.model.js';
import { deleteBlob, uploadBlob } from '../services/blobstorage.js';


// List view
export const viewAllParties = async (req, res) => {
  const parties = await getParties();

  res.render('list', {
    parties,
  });
};
// List API
export const apiAllParties = async (req, res) => {
  const parties = await getParties();
  res.json(parties);
};
// Delete view
export const viewDeleteParty = async (req, res) => {
  const { id } = req.params;

  const party = await getPartyById(id);
  if(!party) return next(createError(400, 'Party not found'));

  res.render('delete', {
    party,
  });
};
// Delete API
export const apiDeleteParty = async (req, res) => {
  const { id } = req.params;

  const party = await getPartyById(id);
  if(!party) return next(createError(400, 'Party not found'));

  await deleteBlob(party.image);
  await deletePartyById(id);
  res.redirect('/');
};
// New view
export const viewAddNewParty = (req, res) => {
  res.render('new');
};
// New API
export const apiAddNewParty = async (req, res) => {
  const {
    name, description, fee, date
  } = req.body;
  let imageBlob = null;
  if (req.file) {
    imageBlob = await uploadBlob(req.file);
  }

  await addParty({
    name,
    description,
    image: imageBlob && imageBlob.image ? imageBlob.image : null,
    fee,
    date
  });
  res.redirect('/');
};
// Edit view
export const viewEditParty = async (req, res) => {
  const { id } = req.params;

  const party = await getPartyById(id);
  if(!party) return next(createError(400, 'Party not found'));

  res.render('edit', {
    party,
  });
};
// Edit API
export const apiEditParty = async (req, res) => {
  const {
    name, description, fee, date
  } = req.body;
  const { id } = req.params;

  const party = await getPartyById(id);
  if(!party) return next(createError(400, 'Party not found'));

  let imageBlob = null;

    if (req.file) {
      await deleteBlob(party.image);
      imageBlob = await uploadBlob(req.file);
    }

    const updatedParty = {
      ...party,
      name,
      description,
      image: imageBlob && imageBlob.image ? imageBlob.image : party.image,
      fee,
      date
    }

    await updateParty(updatedParty);
    res.redirect('/');

};
