import { useCallback, useEffect, useRef, useState } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import { fetchData, updateUserplaces } from './http.js';
import Error from './components/Error.jsx';

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState(false);
  const [errorFetchingUserPlaces, setErrorFetchingUserPlaces] = useState(false);
  const [IsOpenModal, setIsOpenModal] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    async function fetchUserPlaces() {
      setIsFetching(true);
      try {
        const userPlaces = await fetchData('user-places');
        setIsFetching(false);
        setUserPlaces(userPlaces);
      } catch (err) {
        setErrorFetchingUserPlaces({
          message: err.message || 'Failed to get your places. Please try again',
        });
      }

      setIsFetching(false);
    }
    fetchUserPlaces();
  }, []);

  function handleStartRemovePlace(id) {
    setIsOpenModal(true);
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setIsOpenModal(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }

      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      if (!userPlaces.some((place) => place.id === selectedPlace.id)) {
        await updateUserplaces([selectedPlace, ...userPlaces]);
      }
    } catch (err) {
      setErrorUpdatingPlaces({
        message: err.message || 'Failed to update places.',
      });
      setUserPlaces(userPlaces);
    }
  }

  const handleRemovePlace = useCallback(
    async function handleRemovePlace() {
      setUserPlaces((prevPickedPlaces) =>
        prevPickedPlaces.filter(
          (place) => place.id !== selectedPlace.current.id,
        ),
      );
      setIsOpenModal(false);

      try {
        await updateUserplaces(
          userPlaces.filter((place) => place.id !== selectedPlace.current.id),
        );
      } catch (err) {
        setErrorUpdatingPlaces({
          message: err.message || 'Failed to delete the place.',
        });
        setUserPlaces(userPlaces);
      }
    },
    [userPlaces],
  );

  function handleError() {
    setErrorUpdatingPlaces(null);
  }

  return (
    <>
      {
        <Modal open={errorUpdatingPlaces} onClose={handleError}>
          {errorUpdatingPlaces && (
            <Error
              title="An error occurred!"
              message={errorUpdatingPlaces.message}
              onConfirm={handleError}
            />
          )}
        </Modal>
      }
      <Modal open={IsOpenModal} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {errorFetchingUserPlaces && (
          <Error
            title="An error occurred!"
            message={errorFetchingUserPlaces.message}
          />
        )}
        {!errorFetchingUserPlaces && (
          <Places
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            isLoading={isFetching}
            loadingText="Fetching your places..."
            places={userPlaces}
            onSelectPlace={handleStartRemovePlace}
          />
        )}
        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
