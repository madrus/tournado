# Toast example section

```tsx
{
   /* Toast Examples Section */
}
;<div className='py-12'>
   <div className='mx-auto max-w-7xl px-6 lg:px-8'>
      <div className='mx-auto max-w-2xl text-center'>
         <h2 className='mb-8 text-2xl font-bold'>Toast Notifications Demo</h2>
         <div className='flex flex-wrap justify-center gap-4'>
            <ActionButton
               icon='check'
               variant='primary'
               color='emerald'
               className='!border-violet-600 !bg-violet-600 !text-white hover:!bg-violet-700'
               onClick={() =>
                  toast.success('Team created successfully!', {
                     description: 'Your team has been added to the tournament.',
                  })
               }
            >
               Success Toast
            </ActionButton>
            <ActionButton
               icon='error'
               variant='primary'
               color='red'
               className='!border-violet-600 !bg-violet-600 !text-white hover:!bg-violet-700'
               onClick={() =>
                  toast.error('Failed to save team', {
                     description: 'Please check your connection and try again.',
                  })
               }
            >
               Error Toast
            </ActionButton>
            <ActionButton
               icon='warning'
               variant='secondary'
               color='orange'
               className='!border-violet-600 !bg-violet-600 !text-white hover:!bg-violet-700'
               onClick={() =>
                  toast.warning('Tournament is full', {
                     description: 'Only 2 spots remaining for registration.',
                  })
               }
            >
               Warning Toast
            </ActionButton>
            <ActionButton
               icon='info'
               variant='secondary'
               color='sky'
               className='!border-violet-600 !bg-violet-600 !text-white hover:!bg-violet-700'
               onClick={() =>
                  toast.info('New update available', {
                     description: 'Version 2.1.0 includes performance improvements.',
                  })
               }
            >
               Info Toast
            </ActionButton>
         </div>
      </div>
   </div>
</div>
```
