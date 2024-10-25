/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js"; // Votre composant UI
import NewBill from "../containers/NewBill.js"; // Votre classe NewBill
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";
import userEvent from '@testing-library/user-event';
import store from "../__mocks__/store";


// Mock du store
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      // Mock du localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));

      // Créer le DOM pour la page NewBill
      document.body.innerHTML = NewBillUI();
    });

    // Test pour vérifier si le formulaire et ses champs sont bien rendus
    test("Then the form and its fields should be rendered", () => {
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();  // Vérifie que le formulaire est présent

      // Vérifier les champs principaux du formulaire
      expect(screen.getByTestId("expense-type")).toBeTruthy();  
      expect(screen.getByTestId("expense-name")).toBeTruthy();  
      expect(screen.getByTestId("datepicker")).toBeTruthy();    
      expect(screen.getByTestId("amount")).toBeTruthy();        
      expect(screen.getByTestId("vat")).toBeTruthy();           
      expect(screen.getByTestId("pct")).toBeTruthy();           
      expect(screen.getByTestId("commentary")).toBeTruthy();   
      expect(screen.getByTestId("file")).toBeTruthy();          
    });
    
    // Test pour vérifier que la soumission du formulaire avec des données valides appelle updateBill
    test("When submitting the form with valid data, it should call the updateBill function", async () => {
      const newBillInstance = new NewBill({
        document,
        onNavigate: jest.fn(),
        store,
        localStorage: window.localStorage,
      });

      // Mock de la fonction updateBill
      const updateBill = jest.fn(newBillInstance.updateBill);
      newBillInstance.updateBill = updateBill;

      // Remplir les champs du formulaire
      screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "Taxi";
      screen.getByTestId("datepicker").value = "2024-10-18";
      screen.getByTestId("amount").value = "100";
      screen.getByTestId("vat").value = "20";
      screen.getByTestId("pct").value = "20";
      screen.getByTestId("commentary").value = "Business trip";
      
      const fileInput = screen.getByTestId("file");
      const validFile = new File(["image"], "image.png", { type: "image/png" });
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);  // Simuler la soumission du formulaire

      // Vérifier que updateBill a été appelé avec les bonnes données
      expect(updateBill).toHaveBeenCalled();
    });
  });
})
  //****************************** Test d'intégration : Erreur API lors de l'envoi des données */
  describe("Given I am connected as an employee", () => {
 // Réinitialiser les espions et les mocks avant chaque test
 beforeEach(() => {
  jest.clearAllMocks(); // Réinitialiser tous les espions
});
    test('Then if data are corrupted an error 404 should be catched', async () => {
      jest
        .spyOn(mockStore.bills(), 'create')
        .mockRejectedValueOnce(new Error('Erreur 404'));
  
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });
  
      const consoleSpy = jest.spyOn(console, 'error');
  
      const handleChangeFile1 = jest.fn(newBill.handleChangeFile);
      const file = new File(['document'], 'image.png', {
        type: 'image/png',
      });
      const input = screen.getByTestId('file');
  
      input.addEventListener('change', handleChangeFile1);
      userEvent.upload(input, file);
  
      await new Promise(process.nextTick);
  
      const consoleMessage = consoleSpy.mock.calls[0][0].message;
  
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleMessage).toContain('Erreur 404');
    });
  
  
    test('Then if data are corrupted an error 500 should be catched', async () => {
      jest
        .spyOn(mockStore.bills(), 'create')
        .mockRejectedValueOnce(new Error('Erreur 500')); // Simuler une erreur 500
  
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });
  
      const consoleSpy = jest.spyOn(console, 'error');
  
      const handleChangeFile1 = jest.fn(newBill.handleChangeFile);
      const file = new File(['document'], 'image.png', {
        type: 'image/png',
      });
      const input = screen.getByTestId('file');
  
      input.addEventListener('change', handleChangeFile1);
      console.log('Uploading file...');
      userEvent.upload(input, file);
  
      await new Promise(process.nextTick);
  
      const consoleMessage = consoleSpy.mock.calls[0][0].message;
  
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleMessage).toContain('Erreur 500'); // Vérifier que l'erreur 500 est affichée
    });
  });
  


  //   describe("When I submit the form and API returns 404", () => {
  //     beforeEach(() => {
  //       Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  //       window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
  //       document.body.innerHTML = NewBillUI();
  //     });
  
  //     test("Then I should see a 404 error message", async () => {
  //       const newBillInstance = new NewBill({
  //         document,
  //         onNavigate: jest.fn(),
  //         store: mockStore,
  //         localStorage: window.localStorage,
  //       });
  
  //       // Simuler une erreur 404 lors de la création de la facture
  //       mockStore.bills.mockImplementationOnce(() => ({
  //         create: jest.fn(() => Promise.reject({ status: 404 })),
  //       }));
  
  //       // Remplir le formulaire avec des données valides
  //       screen.getByTestId("expense-type").value = "Transports";
  //       screen.getByTestId("expense-name").value = "Taxi";
  //       screen.getByTestId("datepicker").value = "2024-10-18";
  //       screen.getByTestId("amount").value = "100";
  //       screen.getByTestId("vat").value = "20";
  //       screen.getByTestId("pct").value = "20";
  //       screen.getByTestId("commentary").value = "Business trip";
        
  //       const fileInput = screen.getByTestId("file");
  //       const validFile = new File(["image"], "image.png", { type: "image/png" });
  //       fireEvent.change(fileInput, { target: { files: [validFile] } });
  //         // Ajouter un test pour vérifier que le fichier est bien assigné
  //       expect(fileInput.files[0].name).toBe("image.png");
  //       const form = screen.getByTestId("form-new-bill");
  //       fireEvent.submit(form);  // Simuler la soumission du formulaire
  //       await waitFor(() => {
  //         const errorMessage = screen.getByText((content) => content.includes("Erreur 404"));
  //         expect(errorMessage).toBeTruthy();  // Vérifie que l'erreur 404 est affichée
  //       });
  //     });
  //   });
  
  //   describe("When I submit the form and API returns 500", () => {
  //     beforeEach(() => {
  //       Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  //       window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
  //       document.body.innerHTML = NewBillUI();
  //     });
    


  //     test("Then I should see a 500 error message", async () => {
  //       const newBillInstance = new NewBill({
  //         document,
  //         onNavigate: jest.fn(),
  //         store: mockStore,
  //         localStorage: window.localStorage,
  //       });
  
  //       // Simuler une erreur 500 lors de la création de la facture
  //       mockStore.bills.mockImplementationOnce(() => ({
  //         create: jest.fn(() => Promise.reject({ status: 500 })),
  //       }));
  
  //       // Remplir le formulaire avec des données valides
  //       screen.getByTestId("expense-type").value = "Transports";
  //       screen.getByTestId("expense-name").value = "Taxi";
  //       screen.getByTestId("datepicker").value = "2024-10-18";
  //       screen.getByTestId("amount").value = "100";
  //       screen.getByTestId("vat").value = "20";
  //       screen.getByTestId("pct").value = "20";
  //       screen.getByTestId("commentary").value = "Business trip";
        
  //       const fileInput = screen.getByTestId("file");
  //       const validFile = new File(["image"], "image.png", { type: "image/png" });
  //       fireEvent.change(fileInput, { target: { files: [validFile] } });
  //         // Ajouter un test pour vérifier que le fichier est bien assigné
  //       expect(fileInput.files[0].name).toBe("image.png");
  //       const form = screen.getByTestId("form-new-bill");
  //       fireEvent.submit(form);  // Simuler la soumission du formulaire
        
  //       await waitFor(() => {
  //         const errorMessage = screen.getByText((content) => content.includes("Erreur 500"));
  //         expect(errorMessage).toBeTruthy();  // Vérifie que l'erreur 500 est affichée
  //       });
  //     });
  //  });
